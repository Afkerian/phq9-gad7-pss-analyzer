# Analizador de Encuestas de Salud Mental

## Descripción

Esta es una aplicación web del lado del cliente diseñada para procesar y analizar los resultados de cuatro cuestionarios psicométricos comunes utilizados en la evaluación de la salud mental:

* **RSES:** Escala de Autoestima de Rosenberg (para la autoestima global).
* **PHQ-9:** Cuestionario sobre la Salud del Paciente-9 (para la depresión).
* **GAD-7:** Trastorno de Ansiedad Generalizada-7 (para la ansiedad).
* **PSS-14:** Escala de Estrés Percibido (14 ítems).

La herramienta permite a los usuarios cargar un archivo CSV que contiene las respuestas de los encuestados, calcula automáticamente las puntuaciones para cada cuestionario, proporciona interpretaciones basadas en las escalas estandarizadas, y permite filtrar y descargar los resultados procesados.

## Funcionalidades Clave

* **Carga de Archivos CSV:** Permite seleccionar y cargar archivos `.csv` que contienen las respuestas de las encuestas.
* **Procesamiento Automático:**
    * Calcula las puntuaciones totales para RSES, PHQ-9, GAD-7 y PSS-14.
    * Interpreta las puntuaciones para determinar el nivel de severidad/categoría (p. ej., "Autoestima media", "Depresión leve", "Ansiedad moderada", "Estrés elevado").
* **Advertencias Específicas (PHQ-9):** Identifica y resalta si un encuestado ha respondido afirmativamente a la pregunta 9 del PHQ-9 (relacionada con pensamientos de autolesión).
* **Visualización Tabular:** Muestra los resultados procesados en una tabla clara y organizada.
* **Filtrado Dinámico:**
    * Permite filtrar los resultados por **Cédula** (búsqueda de texto libre).
    * Permite filtrar por **Interpretación de RSES** (usando un menú desplegable).
    * Permite filtrar por **Interpretación del PHQ-9** (menú desplegable).
    * Permite filtrar por **Interpretación del GAD-7** (menú desplegable).
    * Permite filtrar por **Interpretación del PSS-14** (menú desplegable).
* **Conteo de Registros:** Muestra el número total de registros procesados y cuántos son visibles después de aplicar filtros.
* **Descarga de Resultados:** Permite descargar la tabla completa de resultados procesados en un nuevo archivo CSV.

## Cómo Usar

1.  **Descargar/Clonar:** Obtén el archivo HTML principal del repositorio.
2.  **Abrir en Navegador:** Abre el archivo HTML directamente en un navegador web moderno.
3.  **Seleccionar Archivo:** Haz clic en el área designada para "seleccionar tu archivo CSV".
4.  **Procesar:** Una vez seleccionado el archivo, el botón "Procesar Archivo" se habilitará. Haz clic en él.
5.  **Ver Resultados:** Los resultados calculados e interpretados aparecerán en una tabla.
6.  **Filtrar (Opcional):**
    * Escribe en el campo debajo de "Cédula" para filtrar por identificador.
    * Selecciona una categoría en los menús desplegables de las columnas de "Interpretación" para filtrar por esos criterios.
    * El contador de registros se actualizará.
7.  **Descargar (Opcional):** Haz clic en "Descargar CSV" para guardar los datos procesados.

## Formato del Archivo CSV de Entrada

* **Delimitador:** Punto y coma (`;`).
* **Encabezados:** La primera fila debe ser de encabezados.
* **Codificación:** La aplicación lee el archivo con codificación `ISO-8859-1` (latin1).
* **Estructura de Columnas Esperada:**
    * **RSES (Autoestima):** Primeras 10 columnas de respuestas (índices 0-9 del CSV).
    * **PHQ-9 (Depresión):** Siguientes 9 columnas de respuestas (índices 10-18 del CSV).
    * **GAD-7 (Ansiedad):** Siguientes 7 columnas de respuestas (índices 20-26 del CSV, asumiendo que hay columnas intermedias para preguntas de funcionalidad del PHQ-9 que no se usan en el cálculo de score).
    * **PSS-14 (Estrés):** Siguientes 14 columnas de respuestas (índices 28-41 del CSV, asumiendo una columna intermedia para funcionalidad del GAD-7).
    * **Cédula:** Se espera en la última columna del archivo.
    * *(Nota: Las columnas de "funcionalidad" de PHQ-9 y GAD-7, si existen entre los bloques de preguntas principales, son omitidas para el cálculo de los scores principales, pero deben estar presentes para que los índices de las preguntas de los tests subsiguientes sean correctos).*

## Cuestionarios y Escalas Utilizadas

* **RSES (Autoestima de Rosenberg):**
    * 10 ítems. Respuestas ("Muy de acuerdo", "De acuerdo", "En desacuerdo", "Muy en desacuerdo") puntuadas de 0-3.
    * Ítems directos (preguntas 1-5 del bloque de autoestima en el CSV): Muy de acuerdo=3, ..., Muy en desacuerdo=0.
    * Ítems inversos (preguntas 6-10 del bloque de autoestima en el CSV): Muy de acuerdo=0, ..., Muy en desacuerdo=3.
    * Interpretación: 0-15 (Baja), 16-25 (Media), 26-30 (Alta).
* **PHQ-9 (Depresión):**
    * Respuestas: "No en absoluto" (0), "Varios días" (1), "Más de la mitad de los días" (2), "Casi todos los días" (3).
    * Interpretación: 0-4 (Mínima/Ausente), 5-9 (Leve), 10-14 (Moderada), 15-19 (Moderadamente Grave), 20-27 (Grave).
* **GAD-7 (Ansiedad):**
    * Respuestas: "Para nada" (0), "Varios días" (1), "Más de la mitad de los días" (2), "Casi todos los días" (3).
    * Interpretación: 0-4 (Mínima), 5-9 (Leve), 10-14 (Moderada), 15-21 (Grave).
* **PSS-14 (Estrés Percibido):**
    * Respuestas: "Nunca" (0/4), "Casi nunca" (1/3), "De vez en cuando" (2/2), "A menudo" (3/1), "Muy a menudo" (4/0). Puntuación invertida para ítems 4, 5, 6, 7, 9, 10, 13 (contando desde 1 dentro del bloque PSS-14).
    * Interpretación: Puntuación total 0-56. 0-19 (Bajo), 20-25 (Moderado), >25 (Elevado).

## Tecnologías Utilizadas

* HTML5
* CSS3 (con [Tailwind CSS](https://tailwindcss.com/))
* JavaScript (Vanilla JS)

## Contribuciones

Las sugerencias y contribuciones son bienvenidas. Por favor, abre un *issue* para discutir cambios mayores o reportar errores.

## Licencia

