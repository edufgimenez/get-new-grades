// ==UserScript==
// @name         Monitor de novas avaliações nas agendas do curso EAD ETEC
// @namespace    https://www.linkedin.com/in/edufgimenez/
// @version      1.0
// @description  Monitora o número de matérias avaliadas em uma página secundária e mostra na página principal do AVA
// @author       Eduardo Gimenez
// @match        https://eadtec.cps.sp.gov.br/home.php
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// ==/UserScript==

(function() {
    'use strict';

    // Função para obter o número de matérias avaliadas da página secundária
    function getNumberOfGrades(callback) {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://eadtec.cps.sp.gov.br/aluno_informacoes_academicas.php",
            onload: function(response) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, "text/html");
                const tables = doc.querySelectorAll('.list');
                if (tables.length >= 9) { // Verifica se há pelo menos 9 tabelas
                    const table = tables[8]; // A nona tabela (índice 8)
                    const row = table.querySelectorAll('tbody > tr')[1]; // Segunda linha (índice 1)
                    const cell = row.querySelector('td[colspan="1"]');
                    if (cell) {
                        const value = cell.textContent.trim();
                        const [current, total] = value.split('/');
                        const currentNumber = parseInt(current);
                        callback(currentNumber);
                    }
                }
            }
        });
    }

    // Função para verificar se houve um aumento no número de matérias avaliadas e atualizar os cookies
    function checkAndNotify() {
        getNumberOfGrades(function(currentNumber) {
            const storedNumber = GM_getValue('numberOfGrades', 0);
            if (currentNumber > storedNumber) {
                alert('Uma nova matéria foi corrigida!');
                GM_setValue('numberOfGrades', currentNumber);
                console.log('Cookie definido com sucesso.');
            } else {
                console.log('Número de matérias não aumentou.');
            }
        });
    }

    // Função para mostrar o número de matérias avaliadas na página principal
    function displayNumberOfGrades(currentNumber) {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '24px';
        container.style.right = '20px';
        container.style.background = 'white';
        container.style.padding = '20px';
        container.style.border = '1px solid #ccc';
        container.style.fontSize = '18px';

        // Criando o elemento link
        const link = document.createElement('a');
        link.href = "https://eadtec.cps.sp.gov.br/aluno_informacoes_academicas.php";
        link.textContent = currentNumber;
        link.style.color = "blue";
        link.style.textDecoration = "underline";
        link.style.fontSize = '18px';

        container.textContent = 'Número de matérias avaliadas: ';
        container.appendChild(link);

        document.body.appendChild(container);
    }

    getNumberOfGrades(function(currentNumber) {
        displayNumberOfGrades(currentNumber);
    });


    // Verifique se houve um aumento quando a página principal for carregada
    checkAndNotify();


    //Função retorna os cookies armazenados pelo tampermonkey ( usado apenas para testes )
//     function listTampermonkeyValues() {
//         const keys = GM_listValues();
//         if (keys.length === 0) {
//             console.log("Sem valores armazenados");
//         } else {
//             console.log("Valores do tampermonkey armazenados:");
//             keys.forEach(function(key) {
//                 const value = GM_getValue(key);
//                 console.log(`${key}: ${value}`);
//             });
//         }
//     }

//     listTampermonkeyValues();

})();

