const pool = require('../db');
const OpenAI = require('openai');

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.createProject = async (req: { body: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { message?: string; error?: string; }): any; new(): any; }; }; }) => {
  const data = req.body;
  const userId = data.user_id;

  if (!userId) {
    return res.status(400).json({ message: 'El campo user_id es obligatorio.' });
  }

  // Función para limpiar texto (trim y fallback a cadena vacía)
  function safeString(value: string) {
    return typeof value === 'string' ? value.trim() : '';
  }

  // Función para procesar arrays, limpiando cada elemento y uniendo por coma
  function safeArrayJoin(arr: any[]) {
    if (!Array.isArray(arr)) return '';
    return arr.filter(item => !!item).map(safeString).join(', ');
  }

  // Prepara las variables para el prompt, limpiando y formateando arrays
  const promptData = {
    project_name: safeString(data.project_name),
    client_name: safeString(data.client_name),
    start_date: safeString(data.start_date),
    delivery_date: safeString(data.delivery_date),
    website: safeString(data.website),
    main_goal: safeString(data.main_goal),
    secondary_goals: safeString(data.secondary_goals),
    current_situation: safeString(data.current_situation),
    challenges: safeString(data.challenges),
    target_audience: safeString(data.target_audience),
    audience_needs: safeString(data.audience_needs),
    main_message: safeString(data.main_message),
    differentiation: safeString(data.differentiation),
    tone: safeString(data.tone),
    channels: safeArrayJoin(data.channels),
    deliverable_formats: safeArrayJoin(data.deliverable_formats),
    expected_deliverables: safeString(data.expected_deliverables),
    limitations: safeString(data.limitations),
    competitors: safeString(data.competitors),
    reference_links: safeString(data.reference_links),
    budget: safeString(data.budget),
    resources: safeString(data.resources),
    milestones: safeString(data.milestones),
    deadlines: safeString(data.deadlines),
    restrictions: safeString(data.restrictions),
    notes: safeString(data.notes),
    branding_links: safeString(data.branding_links),
    final_format: safeString(data.final_format),
  };

  // Construir el prompt dinámico con interpolación segura
  const prompt = `
You are a senior marketing strategist and expert in writing professional creative briefs for agencies, creative teams, and digital marketing campaigns.

Using the information provided below, generate a complete and well-structured creative brief in **English** that is:

- Clear and easy to understand.
- Visually organized with **section titles**, **subtitles**, and **bullet points** where relevant.
- Suitable for use by marketing teams, designers, copywriters, or project managers.
- Structured to flow logically from general context to detailed deliverables.
- **Exclude any sections where data is missing or not provided**.
- The tone should be professional but friendly, and concise.

Here is the input data:

${promptData.project_name ? `- Project Name: ${promptData.project_name}` : ''}
${promptData.client_name ? `- Client Name: ${promptData.client_name}` : ''}
${promptData.start_date ? `- Start Date: ${promptData.start_date}` : ''}
${promptData.delivery_date ? `- Delivery Date: ${promptData.delivery_date}` : ''}
${promptData.website ? `- Website / Social Media: ${promptData.website}` : ''}
${promptData.main_goal ? `- Primary Objective: ${promptData.main_goal}` : ''}
${promptData.secondary_goals ? `- Secondary Goals: ${promptData.secondary_goals}` : ''}
${promptData.current_situation ? `- Current Situation: ${promptData.current_situation}` : ''}
${promptData.challenges ? `- Challenges: ${promptData.challenges}` : ''}
${promptData.target_audience ? `- Target Audience: ${promptData.target_audience}` : ''}
${promptData.audience_needs ? `- Audience Needs: ${promptData.audience_needs}` : ''}
${promptData.main_message ? `- Main Message: ${promptData.main_message}` : ''}
${promptData.differentiation ? `- Product/Service Differentiation: ${promptData.differentiation}` : ''}
${promptData.tone ? `- Tone of Communication: ${promptData.tone}` : ''}
${promptData.channels ? `- Distribution Channels: ${promptData.channels}` : ''}
${promptData.deliverable_formats ? `- Deliverable Formats: ${promptData.deliverable_formats}` : ''}
${promptData.expected_deliverables ? `- Expected Deliverables: ${promptData.expected_deliverables}` : ''}
${promptData.limitations ? `- Constraints or Limitations: ${promptData.limitations}` : ''}
${promptData.competitors ? `- Main Competitors: ${promptData.competitors}` : ''}
${promptData.reference_links ? `- References or Inspirations: ${promptData.reference_links}` : ''}
${promptData.budget ? `- Budget: ${promptData.budget}` : ''}
${promptData.resources ? `- Available Resources: ${promptData.resources}` : ''}
${promptData.milestones ? `- Key Milestones and Deadlines: ${promptData.milestones}` : ''}
${promptData.deadlines ? `- Final Deadlines: ${promptData.deadlines}` : ''}
${promptData.restrictions ? `- Additional Restrictions: ${promptData.restrictions}` : ''}
${promptData.notes ? `- Notes or Comments: ${promptData.notes}` : ''}
${promptData.branding_links ? `- Branding / Visual Identity Links: ${promptData.branding_links}` : ''}
${promptData.final_format ? `- Required Final Format: ${promptData.final_format}` : ''}

Please format the output using markdown-style **titles**, and structure the content to be exported as a well-designed PDF brief.

Do not repeat empty or missing data. Include only relevant and available information. Ensure the brief is aligned with strategic marketing objectives.
`;

  try {
    // Verificar usuario y briefs disponibles
    const userResult = await pool.query('SELECT briefs_available FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    if (userResult.rows[0].briefs_available <= 0) {
      return res.status(403).json({ message: 'No tienes briefs disponibles' });
    }

    // Solicitar generación de brief a OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedBrief = completion.choices[0].message?.content || '';

    // Iniciar transacción
    await pool.query('BEGIN');

    // Guardar proyecto en la BD
    const projectResult = await pool.query(
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
        $27, $28, $29
      ) RETURNING *`,
      [
        userId,
        promptData.client_name,
        promptData.project_name,
        promptData.start_date,
        promptData.delivery_date,
        promptData.website,
        promptData.main_goal,
        promptData.secondary_goals,
        promptData.current_situation,
        promptData.challenges,
        promptData.target_audience,
        promptData.audience_needs,
        promptData.main_message,
        promptData.differentiation,
        promptData.tone,
        promptData.channels ? promptData.channels.split(', ').filter(Boolean) : [],
        promptData.deliverable_formats ? promptData.deliverable_formats.split(', ').filter(Boolean) : [],
        promptData.expected_deliverables,
        promptData.limitations,
        promptData.competitors,
        promptData.reference_links,
        promptData.budget,
        promptData.resources,
        promptData.milestones,
        promptData.deadlines,
        promptData.restrictions,
        promptData.notes,
        promptData.branding_links,
        promptData.final_format,
        generatedBrief,
      ]
    );

    // Descontar 1 brief disponible
    await pool.query('UPDATE users SET briefs_available = briefs_available - 1 WHERE id = $1', [userId]);

    // Confirmar transacción
    await pool.query('COMMIT');

    return res.status(201).json(projectResult.rows[0]);
  } catch (err) {
    console.error('Error al crear proyecto:', err);
    try {
      await pool.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Error haciendo rollback:', rollbackErr);
    }
    return res.status(500).json({ error: 'Error al guardar el proyecto' });
  }
};
