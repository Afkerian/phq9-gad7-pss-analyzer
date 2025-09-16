// DOM Elements
const csvFileInput = document.getElementById('csvFileInput');
const processButton = document.getElementById('processButton');
const generateReportButton = document.getElementById('generateReportButton');
const resultsArea = document.getElementById('resultsArea');
const resultsTableBody = document.querySelector('#resultsTable tbody');
const fileNameDisplay = document.getElementById('file-name-display');
const loadingIndicator = document.getElementById('loadingIndicator');
const filteredRecordCountDisplay = document.getElementById('filteredRecordCountDisplay');

const messageModal = document.getElementById('messageModal');
const modalMessageText = document.getElementById('modalMessageText');
const modalCloseButton = document.getElementById('modalCloseButton');

// Filter elements
const filterCedula = document.getElementById('filterCedula');
const filterRsesInt = document.getElementById('filterRsesInt');
const filterPhq9Int = document.getElementById('filterPhq9Int');
const filterGad7Int = document.getElementById('filterGad7Int');
const filterPss14Int = document.getElementById('filterPss14Int');

let processedDataGlobal = [];
let unrecognizedAnswers = new Set();

const scoreMapPHQGAD = {
    "ningun dia": 0, "no en absoluto": 0, "para nada": 0,
    "varios dias": 1, "mas de la mitad de los dias": 2, "casi todos los dias": 3,
    "un poco dificil": 1, "algo dificil": 2, "muy dificil": 3
};
const scoreMapPSS = {
    "nunca": 0, "casi nunca": 1, "de vez en cuando": 2, "a menudo": 3, "muy a menudo": 4
};
const scoreMapRSESDirect = {
    "muy de acuerdo": 3, "de acuerdo": 2, "en desacuerdo": 1, "muy en desacuerdo": 0
};
const scoreMapRSESReverse = {
    "muy de acuerdo": 0, "de acuerdo": 1, "en desacuerdo": 2, "muy en desacuerdo": 3
};

// Event Listeners
csvFileInput.addEventListener('change', function(event) {
    if (event.target.files.length > 0) {
        fileNameDisplay.textContent = `Archivo: ${event.target.files[0].name}`;
        processButton.disabled = false;
    } else {
        fileNameDisplay.textContent = 'Haz clic aquí para seleccionar tu archivo CSV o XLSX';
        processButton.disabled = true;
        generateReportButton.disabled = true;
    }
});

processButton.addEventListener('click', () => {
    const file = csvFileInput.files[0];
    if (file) {
        loadingIndicator.classList.remove('hidden');
        resultsArea.classList.add('hidden');
        resultsTableBody.innerHTML = '';
        filteredRecordCountDisplay.textContent = '';
        generateReportButton.disabled = true;
        resetFilters();
        unrecognizedAnswers.clear();

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                let csvText = "";
                const fileExtension = file.name.split('.').pop().toLowerCase();

                if (fileExtension === 'xlsx') {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    csvText = XLSX.utils.sheet_to_csv(worksheet, { FS: ',' });
                } else {
                    csvText = e.target.result;
                }

                processedDataGlobal = processCSV(csvText);
                
                if (unrecognizedAnswers.size > 0) {
                    let warningMessage = `<h3 class='font-bold text-lg mb-2 text-yellow-700'>Aviso de Diagnóstico</h3>`;
                    warningMessage += `<p class='mb-3'>Se encontraron respuestas no reconocidas que podrían afectar los cálculos. Esto puede causar puntuaciones incorrectas (como 0 o 28).</p>`;
                    warningMessage += `<p>Por favor, revise que los siguientes textos en su archivo coincidan con los esperados (ej. 'nunca', 'casi nunca', 'de acuerdo', etc.):</p>`;
                    warningMessage += `<ul class='list-disc list-inside bg-gray-100 p-2 rounded mt-2 text-sm'>`;
                    unrecognizedAnswers.forEach(ans => {
                        warningMessage += `<li>"${ans}"</li>`;
                    });
                    warningMessage += `</ul>`;
                    showModal(warningMessage, true);
                }

                populateFilterDropdowns(processedDataGlobal);
                displayResults(processedDataGlobal); 
                resultsArea.classList.remove('hidden');
                if (processedDataGlobal.length > 0) {
                    generateReportButton.disabled = false;
                }
            } catch (error) {
                console.error("Error procesando archivo:", error);
                showModal(`<strong>Error al procesar el archivo:</strong> ${error.message}`);
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        };

        reader.onerror = () => {
            console.error("Error al leer archivo.");
            showModal("<strong>Error al leer el archivo.</strong>");
            loadingIndicator.classList.add('hidden');
        };
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (fileExtension === 'xlsx') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file, 'UTF-8'); 
        }

    } else {
        showModal("<strong>Por favor, selecciona un archivo CSV o XLSX.</strong>");
    }
});

generateReportButton.addEventListener('click', () => {
    if (processedDataGlobal.length > 0) {
        const dataForReport = generateReportData(processedDataGlobal);
        sessionStorage.setItem('surveyReportData', JSON.stringify(dataForReport));
        window.open('report.html', '_blank');
    } else {
        showModal("<strong>No hay datos procesados para generar un reporte.</strong>");
    }
});


modalCloseButton.addEventListener('click', () => messageModal.classList.add('hidden'));
filterCedula.addEventListener('keyup', applyTableFilters);
filterRsesInt.addEventListener('change', applyTableFilters);
filterPhq9Int.addEventListener('change', applyTableFilters);
filterGad7Int.addEventListener('change', applyTableFilters);
filterPss14Int.addEventListener('change', applyTableFilters);

// Utility Functions
function showModal(message, isHtml = false) {
    if (isHtml) {
        modalMessageText.innerHTML = message;
    } else {
        modalMessageText.textContent = message;
    }
    messageModal.classList.remove('hidden');
}

function normalizeAnswer(answer) {
    if (typeof answer !== 'string') return "";
    return answer.replace(/\u00A0/g, ' ').trim()
                 .toLowerCase()
                 .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                 .replace(/\s+/g, ' ')
                 .replace(/^"|"$/g, '');
}

function getScore(originalAnswer, scoreMap) {
    const normalizedAns = normalizeAnswer(originalAnswer);
    if (scoreMap.hasOwnProperty(normalizedAns)) {
        return scoreMap[normalizedAns];
    } else if (originalAnswer && originalAnswer.trim() !== "") {
        unrecognizedAnswers.add(originalAnswer.trim());
    }
    return 0;
}

function calculatePHQ9(answers) {
    let score = 0;
    let warningQ9 = false;
    answers.forEach((ans, index) => {
        const questionScore = getScore(ans, scoreMapPHQGAD);
        score += questionScore;
        if (index === 8 && questionScore > 0) warningQ9 = true;
    });
    let interpretation = "";
    if (score <= 4) interpretation = "Depresión mínima o ausente";
    else if (score <= 9) interpretation = "Depresión leve";
    else if (score <= 14) interpretation = "Depresión moderada";
    else if (score <= 19) interpretation = "Depresión moderadamente grave";
    else if (score >= 20) interpretation = "Depresión grave";
    return { score, phq9_interpretation: interpretation, phq9_warning: warningQ9 };
}

function calculateGAD7(answers) {
    let score = 0;
    answers.forEach(ans => { score += getScore(ans, scoreMapPHQGAD); });
    let interpretation = "";
    if (score <= 4) interpretation = "Ansiedad mínima";
    else if (score <= 9) interpretation = "Ansiedad leve";
    else if (score <= 14) interpretation = "Ansiedad moderada";
    else if (score >= 15) interpretation = "Ansiedad grave";
    return { score, gad7_interpretation: interpretation };
}

function calculateRSES_semantic(answers, headers) {
    let score = 0;
    const reverseScoredIDs = ['[113', '[114', '[115', '[116', '[117'];
    answers.forEach((ans, index) => {
        const isReversed = reverseScoredIDs.some(id => headers[index].includes(id));
        score += getScore(ans, isReversed ? scoreMapRSESReverse : scoreMapRSESDirect);
    });
    let interpretation = "Autoestima alta";
    if (score <= 15) interpretation = "Autoestima baja";
    else if (score <= 25) interpretation = "Autoestima media";
    return { score, rses_interpretation: interpretation };
}

function calculatePSS14_semantic(answers, headers) {
    let score = 0;
    const reverseScoredIDs = ['[139', '[140', '[141', '[142', '[144', '[145', '[148'];
    answers.forEach((ans, index) => {
        let questionScore = getScore(ans, scoreMapPSS);
        const isReversed = reverseScoredIDs.some(id => headers[index].includes(id));
        if (isReversed) {
            questionScore = 4 - questionScore;
        }
        score += questionScore;
    });
    let interpretation = "Estrés elevado";
    if (score <= 19) interpretation = "Estrés bajo";
    else if (score <= 25) interpretation = "Estrés moderado";
    return { score, pss14_interpretation: interpretation };
}

function processCSV(csvText) {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) throw new Error("El archivo CSV está vacío o no tiene datos.");
    
    const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    const cedulaIndex = headers.findIndex(h => 
        h.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().includes('CEDULA')
    );

    if (cedulaIndex === -1) {
        throw new Error("No se pudo encontrar una columna con el nombre 'Cédula' en el archivo.");
    }

    const rses_cols = [], phq9_cols = [], gad7_cols = [], pss14_cols = [];
    
    const gad7QuestionIDs = ['[128', '[129', '[130', '[131', '[132', '[133', '[134'];

    headers.forEach((header, index) => {
        const upperHeader = header.toUpperCase();
        const isGad7Question = gad7QuestionIDs.some(id => upperHeader.includes(id));

        if (isGad7Question) {
            if (!upperHeader.includes('[135')) { 
                gad7_cols.push({ index, header });
            }
        } else if (upperHeader.includes('AUTOESTIMA')) {
            rses_cols.push({ index, header });
        } else if (upperHeader.includes('DEPRESIÓN')) {
            if (!upperHeader.includes('[127')) {
                phq9_cols.push({ index, header });
            }
        } else if (upperHeader.includes('ESTRÉS')) {
            pss14_cols.push({ index, header });
        }
    });

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (currentLine.length <= cedulaIndex) continue; 
        
        const cedula = currentLine[cedulaIndex] ? currentLine[cedulaIndex].trim() : `FILA_${i+1}_SIN_ID`;
        const getAnswer = (line, index) => (index < line.length && line[index] !== undefined ? line[index] : "");

        const rses_answers = rses_cols.map(col => getAnswer(currentLine, col.index));
        const phq9_answers = phq9_cols.map(col => getAnswer(currentLine, col.index));
        const gad7_answers = gad7_cols.map(col => getAnswer(currentLine, col.index));
        const pss14_answers = pss14_cols.map(col => getAnswer(currentLine, col.index));
        
        const rses_headers = rses_cols.map(col => col.header);
        const pss14_headers = pss14_cols.map(col => col.header);

        const rses_result = calculateRSES_semantic(rses_answers, rses_headers);
        const phq9_result = calculatePHQ9(phq9_answers);
        const gad7_result = calculateGAD7(gad7_answers);
        const pss14_result = calculatePSS14_semantic(pss14_answers, pss14_headers);

        data.push({
            cedula,
            rses_score: rses_result.score, rses_interpretation: rses_result.rses_interpretation,
            phq9_score: phq9_result.score, phq9_interpretation: phq9_result.phq9_interpretation, phq9_warning: phq9_result.phq9_warning,
            gad7_score: gad7_result.score, gad7_interpretation: gad7_result.gad7_interpretation,
            pss14_score: pss14_result.score, pss14_interpretation: pss14_result.pss14_interpretation
        });
    }
    return data;
}

function resetFilters() {
    filterCedula.value = "";
    ['filterRsesInt', 'filterPhq9Int', 'filterGad7Int', 'filterPss14Int'].forEach(id => {
        document.getElementById(id).innerHTML = '<option value="">Todas</option>';
    });
}

function populateFilterDropdowns(data) {
    const interpretations = { rses: new Set(), phq9: new Set(), gad7: new Set(), pss14: new Set() };
    data.forEach(row => {
        interpretations.rses.add(row.rses_interpretation);
        interpretations.phq9.add(row.phq9_interpretation);
        interpretations.gad7.add(row.gad7_interpretation);
        interpretations.pss14.add(row.pss14_interpretation);
    });
    const populateSelect = (select, optionsSet) => {
        select.innerHTML = '<option value="">Todas</option>';
        Array.from(optionsSet).sort().forEach(opt => select.add(new Option(opt, opt)));
    };
    populateSelect(filterRsesInt, interpretations.rses);
    populateSelect(filterPhq9Int, interpretations.phq9);
    populateSelect(filterGad7Int, interpretations.gad7);
    populateSelect(filterPss14Int, interpretations.pss14);
}

function displayResults(data) {
    resultsTableBody.innerHTML = ''; 
    if (data.length === 0 && unrecognizedAnswers.size === 0) {
        filteredRecordCountDisplay.textContent = "No se encontraron datos válidos para procesar.";
        showModal("<strong>No se encontraron datos válidos para procesar.</strong> Verifique que el archivo no esté vacío y tenga el formato correcto.");
        return;
    }
    const fragment = document.createDocumentFragment();
    data.forEach(row => {
        const tr = document.createElement('tr');
        let phq9Text = row.phq9_interpretation + (row.phq9_warning ? " (¡Atención pregunta 9!)" : "");
        tr.innerHTML = `
            <td>${row.cedula}</td> 
            <td>${row.rses_score}</td> <td>${row.rses_interpretation}</td>
            <td>${row.phq9_score}</td>
            <td class="${row.phq9_warning ? 'warning' : ''}">${phq9Text}</td>
            <td>${row.gad7_score}</td> <td>${row.gad7_interpretation}</td>
            <td>${row.pss14_score}</td> <td>${row.pss14_interpretation}</td>
        `;
        fragment.appendChild(tr);
    });
    resultsTableBody.appendChild(fragment);
    applyTableFilters();
}

function applyTableFilters() {
    const filters = {
        cedula: filterCedula.value.toLowerCase().trim(),
        rses: filterRsesInt.value,
        phq9: filterPhq9Int.value,
        gad7: filterGad7Int.value,
        pss14: filterPss14Int.value
    };
    let visibleRowCount = 0;
    resultsTableBody.querySelectorAll('tr').forEach(row => {
        const cells = row.cells;
        const rowPhq9Int = cells[4].textContent.split(" (¡Atención pregunta 9!)")[0];
        
        const isVisible = (!filters.cedula || cells[0].textContent.toLowerCase().includes(filters.cedula)) &&
                          (!filters.rses || cells[2].textContent === filters.rses) &&
                          (!filters.phq9 || rowPhq9Int === filters.phq9) &&
                          (!filters.gad7 || cells[6].textContent === filters.gad7) &&
                          (!filters.pss14 || cells[8].textContent === filters.pss14);
        
        row.style.display = isVisible ? "" : "none";
        if (isVisible) visibleRowCount++;
    });
    filteredRecordCountDisplay.textContent = `Mostrando ${visibleRowCount} de ${processedDataGlobal.length} registros`;
}

function generateReportData(data) {
    const reportHeaders = {
        "Cédula": "cedula",
        "Autoestima Puntuación": "rses_score",
        "Autoestima Interpretación": "rses_interpretation",
        "PHQ-9 Puntuación": "phq9_score",
        "PHQ-9 Interpretación": "phq9_interpretation",
        "GAD-7 Puntuación": "gad7_score",
        "GAD-7 Interpretación": "gad7_interpretation",
        "PSS-14 Puntuación": "pss14_score",
        "PSS-14 Interpretación": "pss14_interpretation"
    };

    return data.map(row => {
        let newRow = {};
        for (const header in reportHeaders) {
            newRow[header] = row[reportHeaders[header]];
        }
        // Append warning to PHQ-9 interpretation if present
        if (row.phq9_warning) {
            newRow["PHQ-9 Interpretación"] += " (¡Atención pregunta 9!)";
        }
        return newRow;
    });
}

