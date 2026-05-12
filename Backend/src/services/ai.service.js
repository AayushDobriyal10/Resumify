//generates interview report and resume pdf using google genai api

const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


const prompt = `Generate a JSON object for an interview report that strictly follows this schema:

{
  "matchScore": number (0-100),
  "technicalQuestions": [{ "question": string, "intention": string, "answer": string }],
  "behavioralQuestions": [{ "question": string, "intention": string, "answer": string }],
  "skillGaps": [{ "skill": string, "severity": "low" | "medium" | "high" }],
  "preparationPlan": [{ "day": number, "focus": string, "tasks": [string] }],
  "title": string
}

- Output must be valid JSON.
- Do not add any extra fields.
- Do not add any commentary or text outside the JSON.
- All arrays must be filled, even if empty.

Candidate Details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

example the output must be:
{
  "matchScore": 85,
  "technicalQuestions": [
    {
      "question": "Explain the Event Loop in Node.js and how it handles asynchronous operations.",
      "intention": "To assess the candidate's deep understanding of the Node.js runtime environment and non-blocking I/O.",
      "answer": "Explain the phases of the event loop (timers, I/O callbacks, idle, poll, check, close). Mention the role of the Libuv library, the difference between microtasks (process.nextTick, Promises) and macrotasks (setTimeout, setImmediate), and how the event loop allows Node.js to be performant despite being single-threaded."
    },
    {
      "question": "How did you achieve a 35% reduction in query response time using MongoDB indexing and aggregation?",
      "intention": "To verify the candidate's practical experience with database optimization mentioned in their resume.",
      "answer": "Discuss specific strategies: identifying slow queries using the Profiler or .explain() method, choosing between single-field and compound indexes, and enabling 'covered queries'. For aggregation, mention filtering data early with $match, using $project to limit fields, and optimizing memory usage during $group or $lookup operations."
    },
    {
      "question": "What are the common strategies for implementing caching with Redis in a Node.js application?",
      "intention": "To evaluate the candidate's knowledge of performance optimization and state management.",
      "answer": "Explain the 'Cache-Aside' (Lazy Loading) pattern where the app checks the cache first, then the DB, then updates the cache. Discuss 'Write-Through' pattern, TTL (Time To Live) settings to prevent stale data, and how to handle cache invalidation. Mention using Redis for session management or rate limiting as well."
    },
    {
      "question": "Can you describe the process and challenges of migrating a monolithic application to a modular service-based architecture?",
      "intention": "To test the candidate's architectural thinking and understanding of system design.",
      "answer": "Focus on the identification of bounded contexts, managing shared databases vs. database-per-service, handling inter-service communication (e.g., message queues), and maintaining data consistency. Discuss the challenges of deployment and observability during the transition."
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Tell me about a time you had a technical disagreement with a team member during the migration to a modular architecture.",
      "intention": "To assess communication skills, collaboration, and conflict resolution.",
      "answer": "Use the STAR method (Situation, Task, Action, Result). Focus on how you presented data-driven arguments, listened to the other person, and reached a consensus that prioritized the project's health and scalability."
    },
    {
      "question": "Describe a situation where you had to learn a new technology quickly to meet a project deadline.",
      "intention": "To evaluate adaptability and self-driven learning capabilities.",
      "answer": "Mention the AI Resume Builder project and learning the Gemini API or Puppeteer. Explain the resources used (documentation, tutorials) and how you applied the learning immediately to deliver the feature on time."
    }
  ],
  "skillGaps": [
    {
      "skill": "Message Queues (Kafka/RabbitMQ)",
      "severity": "medium"
    },
    {
      "skill": "Advanced DevOps (CI/CD workflows)",
      "severity": "low"
    },
    {
      "skill": "Distributed Systems experience",
      "severity": "medium"
    },
    {
      "skill": "Production-grade Docker experience",
      "severity": "low"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "Node.js Internals and Performance",
      "tasks": [
        "Deep dive into the Event Loop, Thread Pool, and Buffer management.",
        "Review Streams and Pipe modules for handling large data.",
        "Practice implementing custom error handling and middleware in Express."
      ]
    },
    {
      "day": 2,
      "focus": "Advanced Database Optimization",
      "tasks": [
        "Study MongoDB indexing strategies: Compound, TTL, and Text indexes.",
        "Practice writing complex Aggregation Pipelines for data analytics.",
        "Review MongoDB transactions and ACID compliance in distributed environments."
      ]
    },
    {
      "day": 3,
      "focus": "System Design and Caching",
      "tasks": [
        "Study System Design patterns: Load Balancing, Horizontal vs. Vertical Scaling.",
        "Implement a Redis caching layer for a sample API with proper cache invalidation.",
        "Read about Rate Limiting and Circuit Breaker patterns."
      ]
    },
    {
      "day": 4,
      "focus": "Microservices and Messaging",
      "tasks": [
        "Learn the basics of RabbitMQ or Kafka for asynchronous communication.",
        "Understand the difference between Request-Response and Pub/Sub models.",
        "Research SAGA patterns for managing distributed transactions."
      ]
    },
    {
      "day": 5,
      "focus": "Containerization and CI/CD",
      "tasks": [
        "Practice Dockerizing a multi-container MERN application using Docker Compose.",
        "Learn basic GitHub Actions or Jenkins concepts for automating testing and deployment.",
        "Review environment variable management and secrets handling in production."
      ]
    },
    {
      "day": 6,
      "focus": "Behavioral and Mock Interviews",
      "tasks": [
        "Prepare STAR stories for past projects, especially the tech migration.",
        "Conduct a mock interview focusing on explaining technical choices and trade-offs.",
        "Review the job description to align project examples with specific company needs."
      ]
    },
    {
      "day": 7,
      "focus": "Skill Gap Consolidation and Real-World Practice",
      "tasks": [
        "Create a mini-project combining Node.js, MongoDB, Redis, and Docker to simulate real-world scenarios.",
        "Practice using Kafka or RabbitMQ in the project to strengthen messaging experience.",
        "Review distributed system patterns and how to apply them in microservices.",
        "Conduct a final self-assessment against technical questions and skill gaps to identify areas needing last-minute reinforcement."
      ]
    }
  ]
}
`;


// const prompt = `Generate an interview report for a candidate with the following details:
//                         Resume: ${resume}
//                         Self Description: ${selfDescription}
//                         Job Description: ${jobDescription}
// `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
             responseMimeType: "application/json",
            response_json_Schema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)
    // console.log(response.text)


}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })

    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}

module.exports = { generateInterviewReport, generateResumePdf }
