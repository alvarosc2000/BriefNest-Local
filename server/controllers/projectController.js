const pool = require('../db');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Función para generar PDF estilizado a partir de brief en Markdown usando plantilla HTML
async function generateStyledPDF(projectName, markdownBrief, res) {
  // Importar marked dinámicamente (para evitar problemas con ESM)
  const marked = (await import('marked')).marked;

  const templatePath = path.join(__dirname, '../templates/brief_template.html');
  const htmlTemplate = fs.readFileSync(templatePath, 'utf8');

  const briefContent = marked.parse(markdownBrief); // Markdown a HTML
  const year = new Date().getFullYear();

  const finalHtml = htmlTemplate
    .replace('{{projectName}}', projectName)
    .replace('{{{briefContent}}}', briefContent)
    .replace('{{year}}', year);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '40px', bottom: '60px', left: '40px', right: '40px' },
  });

  await browser.close();

  res.setHeader('Content-Disposition', `attachment; filename="${projectName}_brief.pdf"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(pdfBuffer);
}

// Crear nuevo proyecto y generar brief + PDF
exports.createProject = async (req, res) => {
  const data = req.body;
  const userId = data.user_id;

  try {
    // 1. Validar usuario y créditos disponibles
    const userResult = await pool.query('SELECT briefs_available FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const briefs = userResult.rows[0].briefs_available;
    if (briefs <= 0) return res.status(403).json({ message: 'No tienes briefs disponibles' });

    // 2. Construir prompt para generación del brief en español
    let promptBase = "";

if (data.tone === "Inglés") {
  promptBase = `
        You are a senior marketing, communication, and brand strategist with experience in top-tier agencies. 
        You have led repositionings, integrated campaigns, digital launches, and premium brand building, aligning business vision, creativity, and execution with strategic excellence.

        Your task is to write a **complete, professional, and actionable strategic brief**, based exclusively on the information provided below. 
        This document must be a **real working tool**, useful for general management, strategy, creative teams, media, design, and content. 
        It should connect vision and execution, align decisions, and be capable of activating an integrated campaign with real impact.

        ---

        🎯 EXPECTATIONS

        - **Do not summarize. Interpret.**
          Transform data into strategic insight: detect opportunities, prioritize challenges, translate audiences into behaviors, and link objectives to clear actions.

        - **Write with logic, connection, and purpose.**
          The document should flow naturally: from context to challenge, from consumer to insight, from positioning to tactical execution. Everything must be connected.

        - **Do not copy or literally rephrase.**
          Restructure data with hierarchical thinking. Each section should show intention, understanding of the business, and strategic thought.

        - **Avoid filler, fluff, or generic phrases.**
          Use professional, precise, and actionable language. Write as a senior consultant for a global brand would.

        - **If information is missing, skip that section elegantly.**
          Do not invent or guess. Keep the document clean, serious, and reliable.

        - **Put yourself in the consumer's shoes.**
          Detect tensions, aspirations, and motivations. Connect the brand to real decision moments.

        - **Make the brief operationally useful.**
          Link deliverables to objectives and channels. Explain each piece’s role in the conversion funnel. Add KPIs if possible.

        ---

        ✒️ EXPECTED STYLE

        - Executive tone with creative sensitivity  
        - Strategic, clear, direct language without fluff  
        - Writing aimed at decision-making, not just inspiration  
        - Document usable as a real roadmap

        ---

        🧠 CRITICAL COMPONENTS TO INCLUDE

        The brief should include, whenever information is available, the following strategic blocks:

        - **Consumer Insight**  
          Go beyond demographics: uncover emotional tension, cultural truths, hidden aspirations or frustrations. Explain why this insight matters strategically and how it justifies the communication narrative.  
          If this block is included, wrap it in a **.key-insight** styled box.

        - **Strategic Guiding Concept**  
          Provide a clear, memorable, functional guiding idea. It should unify storytelling, tone, and visuals. If not provided, omit this section — do not invent.

        - **Recommended Narrative**  
          Offer extended guidance: tone of voice, key themes, specific words/ideas to avoid, storytelling style, and examples of visual cues.  
          **Use subheadings with <h3>** for clarity (e.g. “Tone of Voice”, “Words to Avoid”, “Narrative Style”).

        - **Activation Tactical Matrix**  
          Present this section in valid HTML format using the '<table>' tag.  
          It should include clear columns: Objective | Channel | Format | KPI | Message.  
          Use '<thead>' for headers and '<tbody>' for rows.  
          Ensure it is a well-structured and readable table in a PDF document.

        - **Strategic Function of Each Deliverable**  
          Explain the role of each asset in the funnel.  
          **Explicitly add funnel badges** using <span class="badge">Awareness</span>, <span class="badge">Consideration</span>, <span class="badge">Conversion</span>, or <span class="badge">Retention</span>.

        - **What to Avoid**  
          Explicitly list tones, clichés, errors, or creative traps that could weaken positioning.

        - **Execution Risks**  
          Provide clear warnings: potential misinterpretations, operational risks, budgetary or technical pitfalls.  
          If there are multiple risks, present them in a **table** with columns: Risk | Impact | Mitigation.

        - **Competitive Benchmarking**  
          Not just a list of competitors: highlight strengths/weaknesses, gaps, and opportunities for differentiation.  
          Present in table form if possible, for clarity.

        - **Milestones and Key Dates**  
          Present all milestones and key dates in an **HTML table**.  
          The table should include clear columns such as: Milestone | Date | Description.  
          Use <table>, <thead>, and <tbody>. Do not use <div class="timeline"> or <div class="timeline-item">.
        ---

        🧩 COMPLETE BRIEF STRUCTURE

        #### Executive Summary  
        Purpose, context, problem to solve, and vision of success.

        #### Main Objective  
        Central strategic goal of the project.

        #### Secondary Objectives  
        Measurable tactical or functional goals supporting the main objective.

        #### Context / Current Situation  
        Diagnosis of business, brand, category, or digital environment.

        #### Challenges to Solve  
        Critical problems. What must be overcome to achieve the goal?

        #### Target Audience  
        Complete profile: demographic, psychographic, behavioral, digital. What motivates them?

        #### Audience Needs  
        What they really expect from the brand, product, or experience. Link to tension points.

        #### Consumer Insight  
        Emotional truth or tension. Include explanation of relevance and how it can inspire creative storytelling.  
        Render this block inside a **.key-insight** box.

        #### Strategic Guiding Concept  
        One unifying idea that drives the campaign and differentiates the brand. If missing, omit gracefully.

        #### Recommended Creative Narrative  
        Suggested storyline: tone, themes, style, dos & don’ts. Add illustrative examples when possible.  
        Use <h3> subheadings for clarity inside this block.

        #### Value Proposition / Differentiation  
        What makes the brand unique and why it matters to consumers. Connect it to competitive context.

        #### Main Message  
        Single, powerful phrase condensing the promise.

        #### Communication Tone and Style  
        How the brand should sound and appear. Explicitly list what to avoid.

        #### Distribution Channels  
        Recommended media and platforms. Tactical justification for each.

        #### Expected Deliverables  
        List each asset with its strategic function. Add **funnel badges** when explaining roles.

        #### Activation Tactical Matrix  
        Present a structured table linking: Objective → Channel → Format → KPI → Message. Ensure clarity and completeness.

        #### Limitations or Restrictions  
        Budget, regulations, technical limits, legal or editorial framework.

        #### Competitive Benchmarking  
        Detailed review of direct competitors: strengths, weaknesses, opportunities. Present as a table when possible.

        #### References / Inspirations  
        Relevant brands, campaigns, aesthetics. Explain why they are valuable as references.

        #### Available Resources  
        Brand manual, research, visual assets, previous learnings.

        #### Execution Risks  
        Frequent mistakes or risks and how to mitigate them. Use a **Risk | Impact | Mitigation** table if possible.

        #### Milestones and Key Dates  
        Present all milestones and key dates in an **HTML table**.  
        The table should include clear columns such as: Milestone | Date | Description.  
        Use <table>, <thead>, and <tbody>. Do not use <div class="timeline"> or <div class="timeline-item">.

        #### Final Delivery Date

        #### Additional Notes  
        Recommendations, internal alignment criteria, and coordination guidelines.

        ---

        🚨 FINAL REQUIREMENT:

        Write the brief as if it were presented to the executive team of a premium brand.  
        It must read as a professional, strategic, and perfectly executable document.  
        Do not close with empty inspiration; it should be a **clear, operational roadmap useful for creative and business teams**.  
        Extend and contextualize every available section.  
        If input contains short points, expand with context, strategic connections, and relevance explanation.  
        Do not invent data, but analyze implications and practical use.  
        Enrich with layers of strategic thinking.  
        Explain why each point matters and how it should guide execution.  
        Add illustrative examples or potential applications whenever relevant.  
        Transform loose inputs into coherent, actionable blocks.  
        Use <h3> for sub-sections where necessary, badges for funnel roles, timeline format for key dates, and tables for risks or KPIs when there are multiple items.

        📌 FORMATTING RULE:
        - All main sections  MUST be rendered as <h2>.  
        - Subsections within them (e.g., lists, breakdowns, clarifications) must use <h3>.  
        - Do NOT output Markdown headings (#, ##, ###).  
        - Output must be clean HTML with <h2>, <h3>, <p>, <ul>, <li>, and <table> where needed.
        
        `;
} else {
  // Español por defecto
  promptBase = `
        Eres estratega senior en marketing, comunicación y marca, con trayectoria en agencias de primer nivel. Has liderado reposicionamientos, campañas integradas, lanzamientos digitales y construcción de marcas premium, alineando visión de negocio, creatividad y ejecución con excelencia estratégica.

        Tu tarea es redactar un **brief estratégico completo, profesional y accionable**, basado exclusivamente en la información provista más abajo. Este documento debe ser una **herramienta real de trabajo**, útil para dirección general, estrategia, creatividad, medios, diseño y contenido. Debe conectar visión y ejecución, alinear decisiones y ser capaz de activar una campaña integral con impacto real.

        ---

        🎯 LO QUE SE ESPERA DE TI

        - **No resumes. Interpretas.**
          Transforma datos en visión estratégica: detecta oportunidades, prioriza desafíos, traduce audiencias en comportamientos, y vincula objetivos con acciones claras.

        - **Redacta con lógica, conexión y propósito.**
          El documento debe fluir naturalmente: del contexto al desafío, del consumidor al insight, del posicionamiento a la ejecución táctica. Todo debe estar conectado.

        - **No copies ni reformules literalmente.**
          Reestructura los datos con jerarquía de pensamiento. Cada sección debe mostrar intención, entendimiento del negocio y pensamiento estratégico.

        - **Evita relleno, adornos o frases genéricas.**
          Usa lenguaje profesional, preciso y útil. Redacta como lo haría un consultor senior para una marca global.

        - **Si falta información, omite esa sección con elegancia.**
          No inventes ni completes con suposiciones. El documento debe ser limpio, serio y confiable.

        - **Ponte en el lugar del consumidor.**
          Detecta tensiones, aspiraciones y motivaciones. Conecta la marca con momentos reales de decisión del usuario.

        - **Haz el brief operativamente útil.**
          Relaciona entregables con objetivos y canales. Explica el rol de cada pieza en el funnel de conversión. Agrega KPIs si es posible.

        ---

        ✒️ ESTILO ESPERADO

        - Tono ejecutivo con sensibilidad creativa  
        - Lenguaje estratégico, claro, directo y sin adornos  
        - Redacción orientada a toma de decisiones, no solo inspiración  
        - Documento usable como hoja de ruta real

        ---

        🧠 COMPONENTES CRÍTICOS QUE DEBE INCLUIR EL BRIEF

        - **Insight del consumidor**  
          No te quedes en lo obvio: detecta tensiones culturales, aspiraciones emocionales y motivaciones profundas. Explica por qué es relevante y cómo justifica la narrativa.  
          Si este bloque existe, preséntalo en una caja con la clase **.key-insight**.

        - **Concepto estratégico rector**  
          Una idea paraguas clara, memorable y funcional. Debe guiar tono, estilo, storytelling y creatividad. Si no hay información, omite con elegancia.

        - **Narrativa recomendada**  
          Guía extendida sobre cómo contar la historia: tono de voz, palabras prohibidas, enfoques narrativos, ejemplos de recursos visuales.  
          **Usa subtítulos con <h3>** dentro de este bloque (ej: “Tono de voz”, “Palabras prohibidas”, “Estilo narrativo”).

        - **Matriz táctica de activación**  
          Presenta esta sección en **formato HTML válido** con la etiqueta '<table>'.  
          Debe incluir columnas claras: Objetivo | Canal | Formato | KPI | Mensaje.  
          Usa '<thead>' para encabezados y '<tbody>' para filas.  
          Asegúrate de que sea una tabla bien estructurada y legible en un documento PDF.

        - **Función estratégica de cada entregable**  
          Explica cómo cada pieza aporta en el funnel (atraer, educar, convertir, fidelizar).  
          **Agrega badges** para marcar el rol en el funnel, usando <span class="badge">Awareness</span>, <span class="badge">Consideration</span>, <span class="badge">Conversion</span> o <span class="badge">Retention</span>.

        - **Qué evitar**  
          Enumera con claridad qué no debe hacerse: tonos, clichés, errores comunes.

        - **Riesgos de ejecución**  
          Señala posibles desviaciones creativas, riesgos operativos o limitaciones presupuestarias.  
          Si hay varios riesgos, preséntalos en una **tabla** con columnas: Riesgo | Impacto | Mitigación.

        - **Benchmark competitivo**  
          No solo listar competidores: compara fortalezas y debilidades y extrae oportunidades.  
          Si es posible, preséntalo en tabla para mayor claridad.

          #### Hitos y fechas clave  
          Presenta todos los hitos y fechas clave en **tabla HTML**.  
          La tabla debe incluir columnas claras como: Hito | Fecha | Descripción.  
          Usa <table>, <thead> y <tbody>. Evita el formato de timeline con divs.

        ---

        🧩 ESTRUCTURA COMPLETA DEL BRIEF

        #### Resumen ejecutivo  
        Propósito, contexto, problema a resolver y visión de éxito.

        #### Objetivo principal  
        Meta estratégica central del proyecto.

        #### Objetivos secundarios  
        Metas tácticas o funcionales medibles que apoyan el objetivo principal.

        #### Contexto / situación actual  
        Diagnóstico del negocio, la marca, la categoría o el entorno digital.

        #### Desafíos a resolver  
        Problemas críticos. ¿Qué hay que superar para alcanzar la meta?

        #### Público objetivo  
        Perfil completo: demográfico, cultural, actitudinal y digital. ¿Qué lo mueve?

        #### Necesidades del público  
        Qué busca realmente el usuario de la marca o experiencia. Conecta con tensiones.

        #### Insight del consumidor  
        Verdad emocional o cultural que sostiene la narrativa. Explica su relevancia estratégica.  
        Preséntalo en caja con clase **.key-insight**.

        #### Concepto estratégico rector  
        Idea guía que alinee la campaña a una promesa diferenciadora. Si no hay datos, omite.

        #### Narrativa creativa recomendada  
        Tono, temas, estilo de lenguaje, enfoques visuales. Añade ejemplos si es posible.  
        Usa <h3> para subdividir dentro de esta sección.

        #### Propuesta de valor / diferenciación  
        Qué hace única a la marca y por qué eso es relevante. Vincúlalo a la competencia.

        #### Mensaje principal  
        Frase condensada y potente que guíe toda la comunicación.

        #### Tono y estilo de comunicación  
        Cómo debe sonar y proyectarse la marca. Qué evitar.

        #### Canales de distribución  
        Plataformas y medios sugeridos. Justificación táctica de cada uno.

        #### Entregables esperados  
        Listado con función estratégica de cada pieza. Usa badges para marcar el funnel.

        #### Matriz táctica de activación  
        Tabla: Objetivo → Canal → Formato → KPI → Mensaje. Claridad total.

        #### Restricciones o limitaciones  
        Presupuesto, regulaciones, límites técnicos o legales.

        #### Benchmark competitivo  
        Análisis de rivales directos: fortalezas, debilidades, brechas, oportunidades. Mejor en tabla.

        #### Referencias / inspiraciones  
        Marcas o campañas relevantes como guía conceptual o estética. Explica por qué.

        #### Recursos disponibles  
        Manual de marca, investigación, activos visuales, aprendizajes previos.

        #### Riesgos de ejecución  
        Errores comunes y cómo evitarlos. Presenta en tabla Riesgo | Impacto | Mitigación si hay varios.

        #### Hitos y fechas clave  
        Presenta este apartado en **tabla HTML** con columnas: Hito | Fecha | Descripción.  
        No uses <div class="timeline"> ni <div class="timeline-item">.

        #### Fecha de entrega final

        #### Notas adicionales  
        Recomendaciones internas, criterios de validación y coordinación.

        ---

        🚨 REQUISITO FINAL:

        Redacta como si el brief fuera presentado ante la dirección ejecutiva de una marca premium.  
        Debe leerse como un documento estratégico, robusto y perfectamente ejecutable.  
        Nada de frases inspiracionales vacías: debe cerrar como una **hoja de ruta operativa, clara y útil para equipos creativos y de negocio**.  
        Extiende cada sección.  
        Si el input es corto, desarrolla con contexto, conexiones y explicaciones.  
        No inventes datos, pero aporta análisis estratégico y ejemplos de aplicación.  
        Enriquece con capas de reflexión.  
        Explica por qué cada bloque es importante y cómo debe guiar la ejecución.  
        Usa <h3> en subdivisiones internas, badges para funnel, timeline para fechas y tablas para riesgos/KPIs cuando sea necesario.
        
        📌 REGLA DE FORMATO:
        - Todos los apartados principales DEBEN ir como <h2>.  
        - Las subdivisiones internas (ejemplo: listas, desgloses, explicaciones dentro de cada bloque) deben usar <h3>.  
        - No uses encabezados Markdown (#, ##, ###).  
        - El resultado debe ser siempre HTML limpio con <h2>, <h3>, <p>, <ul>, <li>, y <table> cuando corresponda.


        `;
}


    // Concatenación de la información del proyecto
    const prompt = `${promptBase}

    // INFORMACIÓN DEL PROYECTO (input del usuario):
    - Nombre del proyecto: ${data.project_name}
    - Cliente: ${data.client_name}
    - Fecha de inicio: ${data.start_date}
    - Fecha de entrega: ${data.delivery_date}
    - Sitio web / redes sociales: ${data.website}
    - Objetivo principal: ${data.main_goal}
    - Objetivos secundarios: ${data.secondary_goals}
    - Situación actual: ${data.current_situation}
    - Desafíos: ${data.challenges}
    - Público objetivo: ${data.target_audience}
    - Necesidades del público: ${data.audience_needs}
    - Insight del consumidor: ${data.consumer_insight}
    - Concepto rector: ${data.brand_concept}
    - Mensaje principal: ${data.main_message}
    - Diferenciación: ${data.differentiation}
    - Tono de comunicación: ${data.tone}
    - Qué evitar: ${data.donts}
    - Canales de distribución: ${Array.isArray(data.channels) ? data.channels.join(", ") : data.channels}
    - Formatos requeridos: ${Array.isArray(data.deliverable_formats) ? data.deliverable_formats.join(", ") : data.deliverable_formats}
    - Entregables esperados: ${data.expected_deliverables}
    - Limitaciones: ${data.limitations}
    - Competencia: ${data.competitors}
    - Referencias: ${data.reference_links}
    - Presupuesto: ${data.budget}
    - Recursos disponibles: ${data.resources}
    - Hitos clave: ${data.milestones}
    - Fecha final: ${data.deadlines}
    - Restricciones adicionales: ${data.restrictions}
    - Notas: ${data.notes}
    - Identidad visual: ${data.branding_links}
    `;





    const completion = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedBrief = completion.choices[0].message?.content ?? '';

    // 3. Guardar proyecto en BD dentro de transacción
    await pool.query('BEGIN');

    await pool.query(
      `INSERT INTO projects (
        user_id, client_name, project_name, start_date, delivery_date, website,
        main_goal, secondary_goals, current_situation, challenges, target_audience,
        audience_needs, main_message, differentiation, tone, channels,
        deliverable_formats, expected_deliverables, limitations, competitors, reference_links,
        budget, resources, milestones, deadlines, restrictions, notes,
        branding_links, final_format, generated_brief
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30
      )`,
      [
        userId,
        data.client_name, data.project_name, data.start_date, data.delivery_date, data.website,
        data.main_goal, data.secondary_goals, data.current_situation, data.challenges, data.target_audience,
        data.audience_needs, data.main_message, data.differentiation, data.tone,
        Array.isArray(data.channels) ? data.channels : [data.channels],
        Array.isArray(data.deliverable_formats) ? data.deliverable_formats : [data.deliverable_formats],
        data.expected_deliverables, data.limitations, data.competitors, data.reference_links,
        data.budget, data.resources, data.milestones, data.deadlines, data.restrictions, data.notes,
        data.branding_links, data.final_format, generatedBrief,
      ]
    );

    await pool.query('UPDATE users SET briefs_available = briefs_available - 1 WHERE id = $1', [userId]);
    await pool.query('COMMIT');

    // 4. Generar PDF estilizado y enviarlo
    await generateStyledPDF(data.project_name, generatedBrief, res);

  } catch (err) {
    console.error('Error al crear proyecto:', err);
    await pool.query('ROLLBACK');
    res.status(500).json({ error: 'Error al guardar el proyecto' });
  }
};


// Obtener todos los proyectos
exports.getAllProjects = async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener todos los proyectos:', err);
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

// Obtener proyectos por usuario
exports.getProjectsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query('SELECT * FROM projects WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener proyectos del usuario:', err);
    res.status(500).json({ error: 'Error al obtener proyectos del usuario' });
  }
};
