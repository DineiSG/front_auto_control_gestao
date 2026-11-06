
import { useCallback, useState } from "react";
import ExcelJS from "exceljs";


async function carregarImagem(url) {
  if (!url) return null;

  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar a imagem: ${url}`);
  }

  const blob = await resposta.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const resultado = reader.result;

      if (typeof resultado !== "string") {
        reject(new Error("Formato de imagem inválido."));
        return;
      }

      const [prefixo, base64] = resultado.split(",");

      const extensao = prefixo.includes("image/png")
        ? "png"
        : prefixo.includes("image/jpeg")
          ? "jpeg"
          : null;

      if (!extensao || !base64) {
        reject(
          new Error("A imagem deve estar no formato PNG ou JPEG.")
        );
        return;
      }

      resolve({ base64, extensao });
    };

    reader.onerror = () => {
      reject(new Error("Erro ao ler a imagem."));
    };

    reader.readAsDataURL(blob);
  });
}

function formatarPeriodo(periodo) {
  if (!periodo) return "";

  const { inicio, fim, rotulo } = periodo;

  if (rotulo) return rotulo;
  if (inicio && fim) return `Período: ${inicio} a ${fim}`;
  if (inicio) return `A partir de: ${inicio}`;
  if (fim) return `Até: ${fim}`;

  return "";
}

/*function calcularTotal(dados, chave) {
  return dados.reduce((soma, item) => {
    const valor = item[chave];

    if (valor === null || valor === undefined || valor === "") {
      return soma;
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
      throw new Error(
        `O campo "${chave}" contém um valor não numérico.`
      );
    }

    return soma + numero;
  }, 0);
}*/

export default function useExportExcel() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const generateExcel = useCallback(async (config) => {
    setIsExporting(true);
    setError(null);

    try {
      const {
        dados = [],
        colunas = [],
        titulo = "Relatório",
        subtitulo = "",
        periodo = null,
        nomeArquivo = "relatorio.xlsx",
        nomePlanilha = "Relatório",
        logoUrl = null,
        marcaDaguaUrl = null,
        corCabecalhoTitulo = "FFFFFF",
        corCabecalho = "680d8b",
        corTextoCabecalho = "FFFFFF",
        //mostrarTotais = false,
        //chaveRotuloTotal = null,
        //rotuloTotal = "TOTAL GERAL",
        orientacao = "landscape",
        congelarCabecalho = true,
        aplicarFiltro = true,
        formatoData = "dd/mm/yyyy",
        larguraPadrao = 40,
      } = config ?? {};

      if (!Array.isArray(dados)) {
        throw new Error("A propriedade 'dados' deve ser um array.");
      }

      if (!Array.isArray(colunas) || colunas.length === 0) {
        throw new Error(
          "Informe pelo menos uma coluna para o relatório."
        );
      }

      if (colunas.some((coluna) => !coluna.chave || !coluna.titulo)) {
        throw new Error(
          "Cada coluna precisa ter as propriedades 'chave' e 'titulo'."
        );
      }

      if (
        colunas.some(
          (coluna) =>
            colunas.filter((outra) => outra.chave === coluna.chave)
              .length > 1
        )
      ) {
        throw new Error("As chaves das colunas devem ser únicas.");
      }

      if (dados.length === 0) {
        throw new Error("Não existem dados para exportar.");
      }

      const workbook = new ExcelJS.Workbook();

      workbook.creator = "Sistema";
      workbook.created = new Date();


      const worksheet = workbook.addWorksheet(nomePlanilha);


      const quantidadeColunas = colunas.length;
      const ultimaColuna = quantidadeColunas;

      const enderecoColuna = (numero) => {
        let resultado = "";
        let n = numero;

        while (n > 0) {
          const resto = (n - 1) % 26;
          resultado = String.fromCharCode(65 + resto) + resultado;
          n = Math.floor((n - 1) / 26);
        }

        return resultado;
      };

      // Configuração de impressão
      worksheet.pageSetup = {
        orientation: orientacao,
        paperSize: 9, // A4
        fitToPage: true,
        fitToWidth: 0,
        fitToHeight: 0,
        scale: 100,
        margins: {
          left: 0.10,
          right: 0.10,
          top: 0.25,
          bottom: 0.25,
          header: 0.10,
          footer: 0.10,
        },
      };

      // Repete a coluna A em todas as páginas
      worksheet.pageSetup.printTitlesColumn = "A:C";
      // Repete as linhas 1 até 3 em todas as páginas
      worksheet.pageSetup.printTitlesRow = "1:3";

      worksheet.properties.defaultRowHeight = 20;

      // Define largura e formatação das colunas
      worksheet.columns = colunas.map((coluna) => ({
        key: coluna.chave,
        width: coluna.largura ?? larguraPadrao,
        style: {
          numFmt:
            coluna.tipo === "moeda"
              ? '"R$" #,##0.00'
              : coluna.tipo === "percentual"
                ? "0.00%"
                : coluna.tipo === "data"
                  ? formatoData
                  : coluna.formatoNumero ?? "General",
        },
      }));

      // Cabeçalho do relatório
      const linhaTitulo = worksheet.getRow(1);
      linhaTitulo.height = 34;

      const imagemLogo = logoUrl
        ? await carregarImagem(logoUrl).catch(() => null)
        : null;

      const colunaInicialTitulo = imagemLogo ? 1 : 1;

      if (quantidadeColunas >= colunaInicialTitulo) {
        worksheet.mergeCells(
          `${enderecoColuna(colunaInicialTitulo)}1:${enderecoColuna(ultimaColuna)}1`
        );
      }
      const celulaTitulo = linhaTitulo.getCell(colunaInicialTitulo);
      celulaTitulo.value = titulo;
      celulaTitulo.font = {
        name: "Arial",
        size: 16,
        bold: true,
        color: "000000",
      };
      celulaTitulo.fill = {
        type: "pattern",
        pattern: "thick",
        fgColor: { argb: corCabecalhoTitulo },
      };
      celulaTitulo.alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      for (let i = 1; i <= quantidadeColunas; i++) {
        if (i < colunaInicialTitulo) continue;

        linhaTitulo.getCell(i).fill = {
          type: "pattern",
          pattern: "thick",
          fgColor: { argb: corCabecalho },
        };
      }

      // Subtítulo e período
      const linhaSubtitulo = 2;
      const textoSubtitulo = [
        subtitulo,
        formatarPeriodo(periodo),
      ].filter(Boolean).join(" - ");

      if (textoSubtitulo) {
        worksheet.mergeCells(
          `${enderecoColuna(1)}${linhaSubtitulo}:${enderecoColuna(ultimaColuna)}${linhaSubtitulo}`
        );

        const celula = worksheet.getCell(`A${linhaSubtitulo}`);
        celula.value = textoSubtitulo;
        celula.font = {
          name: "Arial",
          size: 10,
          italic: true,
          color: { argb: "404040" },
        };
        celula.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
      }

      // Linha em branco antes da tabela
      const linhaCabecalhoNumero = 4;
      const linhaCabecalho = worksheet.getRow(linhaCabecalhoNumero);
      linhaCabecalho.height = 35;

      colunas.forEach((coluna, indice) => {
        const celula = linhaCabecalho.getCell(indice + 1);
        celula.value = coluna.titulo;
        celula.font = {
          name: "Arial",
          bold: true,
          color: { argb: corTextoCabecalho },
        };
        celula.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: corCabecalho },
        };
        celula.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        celula.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        };
      });

      // Dados da tabela
      dados.forEach((item) => {
        const linha = worksheet.addRow(
          colunas.map((coluna) => {
            const valor = item[coluna.chave];

            if (coluna.tipo === "data" && valor) {
              // Evita problemas de fuso horário para datas no formato YYYY-MM-DD
              const [ano, mes, dia] = String(valor).split("-");

              if (ano && mes && dia) {
                return new Date(
                  Number(ano),
                  Number(mes) - 1,
                  Number(dia)
                );
              }

              return new Date(valor);
            }

            return valor ?? null;
          })
        );

        linha.eachCell({ includeEmpty: true }, (celula, numeroColuna) => {
          const coluna = colunas[numeroColuna - 1];

          celula.alignment = {
            vertical: "middle",
            horizontal: coluna.alinhamento ?? (
              ["moeda", "percentual", "numero"].includes(coluna.tipo)
                ? "right"
                : "left"
            ),
          };
          //bordas da célula
          celula.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          };
        });

      });

      const ultimaLinha = worksheet.lastRow;

      //Ultima linha da tabela
      ultimaLinha.eachCell((celula) => {
        if (celula.text === "TOTAL GERAL") {
          celula.font = {
            ...celula.font,
            bold: true,

          };
          ultimaLinha.border = { top: { style: 'medium' }, bottom: { style: 'medium' }, left: { style: 'thin' }, right: { style: 'thin' } }
        }

      });

      const primeiraLinhaDados = linhaCabecalhoNumero + 1;
      const ultimaLinhaDados = worksheet.rowCount;


      // Linha opcional de totais
      /* if (mostrarTotais) {
         const linhaTotal = worksheet.addRow([]);
 
         colunas.forEach((coluna, indice) => {
           const celula = linhaTotal.getCell(indice + 1);
 
           if (coluna.chave === chaveRotuloTotal) {
             celula.value = rotuloTotal;
           } else if (coluna.total === "soma") {
             celula.value = calcularTotal(dados, coluna.chave);
           } else if (coluna.total === "contagem") {
             celula.value = dados.length;
           } else if (coluna.total === "media") {
             celula.value =
               dados.length > 0
                 /*? calcularTotal(dados, coluna.chave) / dados.length
                 : 0;
           }*/

      /*celula.font = { bold: true };
      //fundo da celula
      celula.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D9EAF7" },
      };
      //borda da celula
      celula.border = {
        top: { style: "thick" },
      };
    });
  }*/

      // Logotipo
      if (imagemLogo) {
        const idLogo = workbook.addImage({
          base64: imagemLogo.base64,
          extension: imagemLogo.extensao,
        });

        worksheet.addImage(idLogo, {
          tl: { col: 0.1, row: 0.1 },
          ext: { width: 180, height: 90 },
        });
      }

      // Marca-d'água: imagem sobreposta à área da planilha
      if (marcaDaguaUrl) {
        const imagemMarca = await carregarImagem(marcaDaguaUrl).catch(
          () => null
        );

        if (imagemMarca) {
          const idMarca = workbook.addImage({
            base64: imagemMarca.base64,
            extension: imagemMarca.extensao,
          });

          worksheet.addImage(idMarca, {
            tl: { col: 1.5, row: primeiraLinhaDados + 0.5 },
            ext: { width: 260, height: 190 },
          });
        }
      }

      // Filtro, congelamento e área de impressão
      if (aplicarFiltro && dados.length > 0) {
        worksheet.autoFilter = {
          from: { row: linhaCabecalhoNumero, column: 1 },
          to: { row: ultimaLinhaDados, column: quantidadeColunas },
        };
      }

      if (congelarCabecalho) {
        worksheet.views = [
          {
            state: "frozen",
            ySplit: linhaCabecalhoNumero,
          },
        ];
      }

      worksheet.pageSetup.printArea =
        `A1:${enderecoColuna(ultimaColuna)}${worksheet.rowCount}`;

      worksheet.pageSetup.printTitlesRow =
        `${linhaCabecalhoNumero}:${linhaCabecalhoNumero}`;

      // Gera e baixa o arquivo
      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = nomeArquivo.toLowerCase().endsWith(".xlsx")
        ? nomeArquivo
        : `${nomeArquivo}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      const mensagem =
        err instanceof Error
          ? err.message
          : "Não foi possível gerar o relatório.";

      setError(mensagem);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    generateExcel,
    isExporting,
    error,
  };
}
