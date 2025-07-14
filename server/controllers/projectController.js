const pool = require('../db');
const OpenAI = require('openai');
const PDFDocument = require('pdfkit');

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Crear proyecto con generación de brief y descarga automática del PDF
exports.createProject = async (req, res) => {
  const data = req.body;
  const userId = data.user_id;

  try {
    // 1. Verificar usuario y briefs disponibles
    const userResult = await pool.query('SELECT briefs_available FROM users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const briefs = userResult.rows[0].briefs_available;

    if (briefs <= 0) {
      return res.status(403).json({ message: 'No tienes briefs disponibles' });
    }

    // 2. Prompt para la IA
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

      - Project Name: ${data.project_name}
      - Client Name: ${data.client_name}
      - Start Date: ${data.start_date}
      - Delivery Date: ${data.delivery_date}
      - Website / Social Media: ${data.website}
      - Primary Objective: ${data.main_goal}
      - Secondary Goals: ${data.secondary_goals}
      - Current Situation: ${data.current_situation}
      - Challenges: ${data.challenges}
      - Target Audience: ${data.target_audience}
      - Audience Needs: ${data.audience_needs}
      - Main Message: ${data.main_message}
      - Product/Service Differentiation: ${data.differentiation}
      - Tone of Communication: ${data.tone}
      - Distribution Channels: ${Array.isArray(data.channels) ? data.channels.join(", ") : data.channels}
      - Deliverable Formats: ${Array.isArray(data.deliverable_formats) ? data.deliverable_formats.join(", ") : data.deliverable_formats}
      - Expected Deliverables: ${data.expected_deliverables}
      - Constraints or Limitations: ${data.limitations}
      - Main Competitors: ${data.competitors}
      - References or Inspirations: ${data.reference_links}
      - Budget: ${data.budget}
      - Available Resources: ${data.resources}
      - Key Milestones and Deadlines: ${data.milestones}
      - Final Deadlines: ${data.deadlines}
      - Additional Restrictions: ${data.restrictions}
      - Notes or Comments: ${data.notes}
      - Branding / Visual Identity Links: ${data.branding_links}
      - Required Final Format: ${data.final_format}

      Please format the output using markdown-style **titles**, and structure the content to be exported as a well-designed PDF brief.

      Do not repeat empty or missing data. Include only relevant and available information. Ensure the brief is aligned with strategic marketing objectives.
      `;


    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedBrief = completion.choices[0].message?.content ?? '';

    // 3. Iniciar transacción
    await pool.query('BEGIN');

    // 4. Guardar proyecto
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

    // 5. Descontar crédito
    await pool.query(
      'UPDATE users SET briefs_available = briefs_available - 1 WHERE id = $1',
      [userId]
    );

    // 6. Confirmar transacción
    await pool.query('COMMIT');

    // 7. Generar y enviar PDF
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Disposition', `attachment; filename="${data.project_name}_brief.pdf"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfData);
    });

    doc.fontSize(20).text(`Brief del Proyecto: ${data.project_name}`, { align: 'center', underline: true });
    doc.moveDown();
    doc.fontSize(12).text(generatedBrief, { align: 'left' });
    doc.end();

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
