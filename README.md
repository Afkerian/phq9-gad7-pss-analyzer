# 🧠 Analizador y Generador de Reportes de Encuestas de Salud Mental

Bienvenido a una **suite web integral** para el análisis, visualización y reportería de resultados de los cuestionarios psicométricos más utilizados en salud mental: **RSES, PHQ-9, GAD-7 y PSS-14**.

---

## 🚀 ¿Qué hace esta aplicación?

- **Carga, procesa y analiza** datos brutos de encuestas (.xlsx o .csv).
- **Calcula e interpreta** automáticamente las puntuaciones de cada cuestionario.
- **Visualiza** los resultados en gráficos interactivos.
- **Exporta** los reportes en PDF o CSV, listos para compartir o analizar.

---

## 🗂️ Cuestionarios Soportados

- **RSES:** Escala de Autoestima de Rosenberg
- **PHQ-9:** Cuestionario sobre la Salud del Paciente-9 (Depresión)
- **GAD-7:** Trastorno de Ansiedad Generalizada-7 (Ansiedad)
- **PSS-14:** Escala de Estrés Percibido (14 ítems)

---

## 🏄‍♂️ Flujo de Trabajo Sencillo

1. **Analiza tus datos**  
   Abre `index.html` en tu navegador, carga tu archivo de encuesta y obtén una tabla interactiva con los resultados y diagnósticos automáticos.

2. **Visualiza y reporta**  
   Haz clic en "Generar Reporte Gráfico" para abrir `report.html` y ver histogramas, resúmenes y opciones de descarga en PDF o CSV.

---

## ✨ Funcionalidades Destacadas

### 1. Analizador de Cuestionarios (`index.html`)
- **Carga flexible:** Acepta archivos `.xlsx` y `.csv`.
- **Identificación inteligente:** Detecta preguntas y cédula por palabras clave y códigos, sin importar el orden de las columnas.
- **Procesamiento automático:** Calcula e interpreta puntuaciones de los cuatro cuestionarios.
- **Diagnóstico de datos:** Advierte sobre respuestas no reconocidas o inconsistentes.
- **Alerta PHQ-9:** Resalta respuestas afirmativas sobre autolesión.
- **Filtrado dinámico:** Filtra resultados por cédula o interpretación.
- **Integración directa:** Un clic para enviar datos al generador de reportes.

### 2. Generador de Reportes (`report.html`)
- **Recepción automática:** Recibe datos del analizador o permite carga manual de CSV procesado.
- **Visualización gráfica:** Histogramas claros para cada cuestionario.
- **Resumen cuantitativo:** Muestra el total de participantes.
- **Exportación fácil:** Descarga reportes en PDF visual o datos en CSV.

---

## 📥 ¿Cómo usar la aplicación?

1. **Abre** `index.html` en tu navegador.
2. **Selecciona** tu archivo de encuesta (.xlsx o .csv).
3. **Procesa** los datos y explora la tabla interactiva.
4. *(Opcional)* **Filtra** por cédula o interpretación.
5. **Genera el reporte gráfico** (abre `report.html` automáticamente).
6. **Descarga** el informe en PDF o los datos en CSV.

---

## 📑 Formato de Entrada

- **Formato:** `.xlsx` o `.csv`
- **Encabezados:** La primera fila debe contener los nombres de las columnas.
- **Identificadores:**  
  - Palabras clave en encabezados para agrupar preguntas (ej. "AUTOESTIMA", "DEPRESIÓN", "ESTRÉS").
  - Para GAD-7, busca códigos únicos (ej. `[128]`, `[129]`, etc.).
  - La columna de identificación debe contener "Cédula" (con o sin tilde, mayúsculas o minúsculas).
- **Respuestas:** El texto debe ser consistente (ej. "nunca", "casi nunca", "de acuerdo"). El sistema te avisará si detecta inconsistencias.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5**
- **CSS3** (Tailwind CSS)
- **JavaScript** (Vanilla JS)
- **PapaParse:** Análisis de CSV en el navegador
- **SheetJS (XLSX):** Lectura de archivos Excel
- **Chart.js:** Gráficos interactivos
- **jsPDF & html2canvas:** Exportación de reportes en PDF

---

## 📸 Vista previa

> *(Agrega aquí capturas de pantalla si lo deseas)*

---

## 🤝 Contribuciones

¿Tienes ideas o mejoras? ¡Las contribuciones son bienvenidas!

---

## 📄 Licencia

MIT

---