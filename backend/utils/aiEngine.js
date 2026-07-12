/**
 * Rule-Based AI Engine for PrimeAI Career Coach
 * Contains 100+ predefined rules for resume analysis, skill matching,
 * roadmaps, interview evaluation (self-intro analysis and 112 MCQ questions).
 * Designed for easy future transition to dynamic LLM API endpoints.
 */

// 1. Skill Definitions by Role
const ROLE_SKILL_REQUIREMENTS = {
  "frontend developer": [
    "html", "css", "tailwind css", "javascript", "typescript",
    "react", "redux", "next.js", "git", "github", "rest api"
  ],
  "react developer": [
    "html", "css", "tailwind css", "javascript", "typescript",
    "react", "redux", "next.js", "git", "github", "rest api"
  ],
  "backend developer": [
    "javascript", "typescript", "node.js", "express.js", "mongodb",
    "mysql", "postgresql", "rest api", "git", "github", "jwt", "authentication"
  ],
  "node developer": [
    "javascript", "typescript", "node.js", "express.js", "mongodb",
    "rest api", "git", "github", "jwt", "authentication"
  ],
  "full stack developer": [
    "html", "css", "tailwind css", "javascript", "typescript",
    "react", "node.js", "express.js", "mongodb", "rest api",
    "git", "github", "jwt", "authentication", "django"
  ],
  "python developer": [
    "python", "django", "flask", "postgresql", "git", "github",
    "rest api", "numpy", "pandas", "java", "c++"
  ],
  "data analyst": [
    "python", "pandas", "numpy", "power bi", "excel", "sql",
    "postgresql", "mysql", "git"
  ],
  "machine learning engineer": [
    "python", "numpy", "pandas", "scikit learn", "tensorflow",
    "pytorch", "git", "github", "sql"
  ],
  "ai engineer": [
    "python", "numpy", "pandas", "scikit learn", "tensorflow",
    "pytorch", "git", "github", "rest api"
  ],
  "software engineer": [
    "java", "c++", "python", "javascript", "git", "github",
    "rest api", "sql", "docker"
  ],
  "cloud engineer": [
    "docker", "aws", "git", "github", "rest api", "docker", "sql"
  ],
  "devops engineer": [
    "docker", "aws", "git", "github", "rest api", "docker", "sql"
  ],
  "cyber security": [
    "python", "git", "github", "authentication", "jwt"
  ]
};

// Standard tutorials search mappings for skills
const SKILL_TUTORIALS = {
  "html": { title: "HTML Crash Course", url: "https://www.w3schools.com/html/", type: "documentation" },
  "css": { title: "CSS Layouts Guide", url: "https://css-tricks.com/", type: "article" },
  "tailwind css": { title: "Tailwind CSS Docs", url: "https://tailwindcss.com/docs", type: "documentation" },
  "javascript": { title: "JavaScript Info", url: "https://javascript.info/", type: "documentation" },
  "typescript": { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", type: "documentation" },
  "react": { title: "React Dev Documentation", url: "https://react.dev/", type: "documentation" },
  "redux": { title: "Redux Toolkit Tutorial", url: "https://redux-toolkit.js.org/", type: "documentation" },
  "next.js": { title: "Next.js Learning Course", url: "https://nextjs.org/learn", type: "documentation" },
  "node.js": { title: "Node.js Guide", url: "https://nodejs.org/en/docs", type: "documentation" },
  "express.js": { title: "Express.js Routing Guide", url: "https://expressjs.com/", type: "documentation" },
  "mongodb": { title: "MongoDB University", url: "https://learn.mongodb.com/", type: "documentation" },
  "mysql": { title: "MySQL Tutorial", url: "https://www.mysqltutorial.org/", type: "documentation" },
  "postgresql": { title: "PostgreSQL Tutorial", url: "https://www.postgresqltutorial.com/", type: "documentation" },
  "rest api": { title: "RESTful API Tutorial", url: "https://restfulapi.net/", type: "article" },
  "git": { title: "Git Flight Manual", url: "https://github.com/k88hudson/git-flight-manual", type: "article" },
  "github": { title: "GitHub Hello World", url: "https://docs.github.com/en/get-started", type: "documentation" },
  "python": { title: "Python For Beginners", url: "https://docs.python.org/3/tutorial/", type: "documentation" },
  "java": { title: "Java Programming Basics", url: "https://dev.java/learn/", type: "documentation" },
  "c++": { title: "C++ Documentation", url: "https://en.cppreference.com/", type: "documentation" },
  "pandas": { title: "Pandas Getting Started", url: "https://pandas.pydata.org/docs/", type: "documentation" },
  "numpy": { title: "NumPy Quickstart", url: "https://numpy.org/doc/stable/user/quickstart.html", type: "documentation" },
  "scikit learn": { title: "Scikit-Learn ML Tutorial", url: "https://scikit-learn.org/stable/tutorial/", type: "documentation" },
  "tensorflow": { title: "TensorFlow Tutorials", url: "https://www.tensorflow.org/tutorials", type: "documentation" },
  "pytorch": { title: "PyTorch Basics", url: "https://pytorch.org/tutorials/", type: "documentation" },
  "power bi": { title: "Power BI Learning Path", url: "https://learn.microsoft.com/en-us/power-bi/", type: "documentation" },
  "excel": { title: "Excel Advanced Formulas", url: "https://exceljet.net/", type: "article" },
  "sql": { title: "SQL Zoo Interactive Exercises", url: "https://sqlzoo.net/", type: "article" },
  "docker": { title: "Docker Curriculum", url: "https://docker-curriculum.com/", type: "article" },
  "aws": { title: "AWS Getting Started", url: "https://aws.amazon.com/getting-started/", type: "documentation" },
  "firebase": { title: "Firebase Fundamentals", url: "https://firebase.google.com/docs", type: "documentation" },
  "jwt": { title: "JWT.io Introduction", url: "https://jwt.io/introduction", type: "article" },
  "authentication": { title: "Web Security Cheat Sheet", url: "https://cheatsheetseries.owasp.org/", type: "article" },
  "django": { title: "Django Web Framework Docs", url: "https://docs.djangoproject.com/en/stable/", type: "documentation" }
};

// 2. 112 Mock Interview Questions (8 roles x 14 questions = 112 total)
const ROLE_MCQ_BANK = {
  "frontend": [
    {
      q: "Which hook should be used to memoize the result of an expensive calculation in React?",
      options: ["useCallback", "useMemo", "useRef", "useEffect"],
      correct: 1,
      explanation: "useMemo returns a memoized value which only recalculates when one of the dependencies has changed. useCallback memoizes the callback function itself."
    },
    {
      q: "What is the difference between custom React hooks and normal helper functions?",
      options: ["Custom hooks can call other hooks", "Helper functions run faster", "Custom hooks must return JSX", "Helper functions cannot take parameters"],
      correct: 0,
      explanation: "A custom hook is a Javascript function whose name starts with 'use' and that may call other React hooks. Normal helper functions cannot use hooks."
    },
    {
      q: "How does React's Virtual DOM improve browser rendering performance?",
      options: ["By directly bypassing the CSSOM tree", "By batching DOM updates and applying only the differences (diffing)", "By compiling components to assembly code", "By storing all images in local cache memory"],
      correct: 1,
      explanation: "React creates a Virtual DOM tree. When state changes, it compares the new Virtual DOM with the previous one, computes the minimum diff, and updates only those modified elements in the actual DOM."
    },
    {
      q: "What is the purpose of the 'useEffect' dependency array?",
      options: ["It defines which JSX tags will render", "It restricts component imports", "It controls when the hook runs based on variable changes", "It allocates RAM buffer size"],
      correct: 2,
      explanation: "If the dependency array is empty [], the effect runs once after mounting. If it has values [prop, state], the effect runs whenever those values change."
    },
    {
      q: "What type of scoping does 'var' use in Javascript compared to 'let' and 'const'?",
      options: ["Lexical scope", "Function scope", "Block scope", "Global scope only"],
      correct: 1,
      explanation: "Variables declared with 'var' are function-scoped or globally-scoped. 'let' and 'const' are block-scoped, meaning they only exist within the enclosing {} curly brackets."
    },
    {
      q: "Which CSS layout method is best optimized for one-dimensional layouts (either a row OR a column)?",
      options: ["CSS Grid", "Absolute Positioning", "Flexbox", "Table Layout"],
      correct: 2,
      explanation: "Flexbox is designed for one-dimensional layouts (a row or a column), whereas CSS Grid is designed for two-dimensional layouts (rows and columns simultaneously)."
    },
    {
      q: "What is an HTML semantic element?",
      options: ["A tag that has no styles", "A tag that describes its meaning to both the browser and the developer", "A tag containing animated icons", "A Javascript utility tag"],
      correct: 1,
      explanation: "Semantic elements (like <header>, <article>, and <footer>) clearly describe their meaning to screen readers, search engines, and developers, unlike generic <div> or <span> tags."
    },
    {
      q: "In Git, what does 'git merge --no-ff' do?",
      options: ["Fast-forwards without checks", "Forces a new commit to be created even if a fast-forward is possible", "Cancels a merge dynamically", "Pushes commits directly to origin main"],
      correct: 1,
      explanation: "The --no-ff flag prevents git merge from executing a fast-forward, ensuring that a merge commit is always created to preserve the historical branch structure."
    },
    {
      q: "What is the primary benefit of Redux Toolkit over vanilla Redux?",
      options: ["It automatically links to MongoDB database", "It eliminates the need for any action creators", "It reduces boilerplate code and includes default middleware like Redux Thunk", "It allows components to bypass state completely"],
      correct: 2,
      explanation: "Redux Toolkit (RTK) is the official, opinionated toolset that includes pre-configured thunk middleware, immer library for mutable updates, and eliminates standard boilerplate."
    },
    {
      q: "What does the HTTP 403 Forbidden status code mean?",
      options: ["The server has crashed", "The URL path is not found", "The client is unauthenticated", "The client is authenticated but does not have permission to access the resource"],
      correct: 3,
      explanation: "HTTP 403 Forbidden indicates that the server understands the request but refuses to authorize it, often due to insufficient user privileges. (401 is Unauthenticated)."
    },
    {
      q: "What is the primary purpose of a JSX key attribute in React lists?",
      options: ["To style elements individually", "To uniquely identify list items so React knows which ones changed, were added, or removed", "To encrypt user data in local states", "To link click handlers automatically"],
      correct: 1,
      explanation: "Keys help React identify which items have changed, been added, or been removed. They should be stable, unique string identifiers, avoiding array indexes."
    },
    {
      q: "How does the JS event loop handle asynchronous tasks?",
      options: ["By executing them on separate background CPU cores in parallel", "By queuing them in the Task Queue and executing them after the Call Stack is empty", "By blocking all user scroll interactions", "By using memory virtual paging"],
      correct: 1,
      explanation: "The event loop continuously checks the Call Stack. If empty, it pulls the first callback from the Task/Microtask Queue and pushes it to the Call Stack for execution."
    },
    {
      q: "Which CSS property is used to change the stacking order of overlapping HTML elements?",
      options: ["display", "z-index", "position-rank", "float-order"],
      correct: 1,
      explanation: "The z-index property specifies the stack order of elements that have a positioned element setting (absolute, relative, fixed, or sticky)."
    },
    {
      q: "What is a Promise in JavaScript?",
      options: ["A contract that guarantees code executes synchronously", "An object representing the eventual completion or failure of an asynchronous operation", "A tool to save credentials to localStorage", "A type of recursive function loop"],
      correct: 1,
      explanation: "A Promise is an object representing the eventual completion (resolved) or failure (rejected) of an asynchronous operation and its resulting value."
    }
  ],
  "backend": [
    {
      q: "What is the role of middleware in an Express.js application?",
      options: ["To query MongoDB databases directly", "Functions that have access to request and response objects, capable of modifying them or ending the cycle", "To compile Javascript into binary", "To manage client-side routes"],
      correct: 1,
      explanation: "Express middleware can execute code, make changes to the request and response objects, end the request-response cycle, and invoke the next middleware in line."
    },
    {
      q: "Why should you create an index in MongoDB?",
      options: ["To structure databases into tables", "To improve query execution performance and speed up lookups", "To enforce strict data validation rules", "To compress files on disk"],
      correct: 1,
      explanation: "Without indexes, MongoDB must perform a collection scan (scan every document) to find matching queries. Indexes store a small portion of the collection's data set in an easy-to-traverse form."
    },
    {
      q: "In Node.js, what is the 'event loop'?",
      options: ["A multi-threaded CPU parallel loop", "A mechanism that executes non-blocking asynchronous operations by offloading tasks to the system kernel", "A database sync function", "A client-side event handler"],
      correct: 1,
      explanation: "The event loop allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded, by offloading operations to the system kernel when possible."
    },
    {
      q: "Which standard encryption algorithm is recommended for hashing user passwords in a Node backend?",
      options: ["MD5", "SHA-1", "bcrypt", "Base64"],
      correct: 2,
      explanation: "bcrypt is specifically designed for password hashing, using a salt factor to slow down brute force attacks. MD5 and SHA-1 are cryptographically broken and insecure for passwords."
    },
    {
      q: "How does JWT (JSON Web Token) authentication work between client and server?",
      options: ["The server stores the token session in memory, client sends session id cookie", "The server signs a stateless token containing claims, client sends it in the Authorization header", "The server queries the DB on every single socket packet validation", "The client encrypts the database directly"],
      correct: 1,
      explanation: "JWT is stateless. The server validates the signature of the incoming token in the Authorization header, allowing secure verification without reading a database session table every time."
    },
    {
      q: "What is the purpose of the HTTP POST verb in REST APIs?",
      options: ["To retrieve data from a database", "To create a new resource on the server", "To update an existing resource completely", "To delete a resource"],
      correct: 1,
      explanation: "In RESTful API design, POST is used to submit data to the specified resource, resulting in the creation of a new database entry or resource."
    },
    {
      q: "Which database design pattern is a key advantage of NoSQL document stores like MongoDB?",
      options: ["Rigid table normalization", "Schemaless/Flexible schema documents", "Required foreign keys constraints", "Built-in server rendering modules"],
      correct: 1,
      explanation: "NoSQL document stores allow documents in the same collection to have different fields, which supports rapid prototyping and complex nested data hierarchies without costly migrations."
    },
    {
      q: "What does CORS stand for, and why is it enforced by browsers?",
      options: ["Cross-Origin Resource Sharing; to protect users by blocking cross-domain API requests unless explicitly authorized", "Central Origin Recovery System; to backup server databases", "Client Origin Request Socket; to optimize web page speed", "Cyber Offensive Response Shield; to block network viruses"],
      correct: 0,
      explanation: "CORS is a browser security mechanism that restricts resources on a web page from being requested from another domain outside the domain from which the first resource was served."
    },
    {
      q: "In Node.js, what is the difference between 'process.nextTick()' and 'setImmediate()'?",
      options: ["setImmediate runs before nextTick", "process.nextTick runs callbacks at the end of the current operation phase, before the event loop continues; setImmediate runs in the next loop tick", "Both are exact aliases", "process.nextTick is client-side only"],
      correct: 1,
      explanation: "process.nextTick fires immediately after the current operation executes, bypassing the event loop queue. setImmediate schedules callbacks to run on the next event loop iteration."
    },
    {
      q: "How do you handle unhandled exceptions in a Node.js process to prevent server crashes?",
      options: ["Use print statements only", "Listen to the 'uncaughtException' process event and perform a graceful shutdown", "By ignoring database calls", "By using browser try-catch blocks"],
      correct: 1,
      explanation: "Listening to process.on('uncaughtException') allows logging the error, closing open database connections/servers, and restarting the process safely (e.g., using PM2)."
    },
    {
      q: "What is a Node.js Stream?",
      options: ["An array of database values", "An abstract interface for working with streaming data chunk-by-chunk without loading all of it in memory", "A WebSocket communication line", "An external styling component"],
      correct: 1,
      explanation: "Streams process data in chunks. This prevents high memory usage when reading large files (like video files or database dumps) because you don't load the entire file into RAM at once."
    },
    {
      q: "What is the purpose of database indexes?",
      options: ["To restrict data entries", "To speed up query performance by creating structured search trees instead of scanning all collections", "To format output text to uppercase", "To define table relationships"],
      correct: 1,
      explanation: "An index structures data fields (often using B-Trees) so MongoDB can quickly locate records without scanning the entire collection sequentially, saving CPU and IO resources."
    },
    {
      q: "What HTTP response code should a server return when a request successfully creates a resource?",
      options: ["200 OK", "201 Created", "204 No Content", "302 Found"],
      correct: 1,
      explanation: "HTTP 201 Created indicates that the request has been fulfilled and has resulted in one or more new resources being created on the server."
    },
    {
      q: "Why is 'body-parser' (or Express built-in express.json()) middleware needed?",
      options: ["To style forms", "To parse incoming request bodies in a middleware before handlers, exposing payload on req.body", "To speed up router caching", "To encrypt API payloads"],
      correct: 1,
      explanation: "Express does not parse JSON payloads automatically. Using express.json() parses incoming request bodies with JSON payloads and populates the `req.body` property."
    }
  ],
  "full stack": [
    {
      q: "What does 'SSR' (Server-Side Rendering) offer compared to 'CSR' (Client-Side Rendering)?",
      options: ["Bypasses local state hooks", "Faster initial page load and better SEO because the HTML is pre-rendered on the server", "Stateless server authentication", "Automatic MongoDB backups"],
      correct: 1,
      explanation: "With SSR, the server sends a fully rendered HTML page to the client. This allows search engine bots to index the page content immediately and improves initial content painting."
    },
    {
      q: "What is the function of CORS headers in full stack communication?",
      options: ["They compress data payloads", "They instruct the browser whether to allow web applications running at one domain to access resources on another", "They encrypt passwords", "They map server folders to domains"],
      correct: 1,
      explanation: "CORS headers (like Access-Control-Allow-Origin) are sent by the server to tell the browser which cross-origin clients are allowed to read the API responses."
    },
    {
      q: "How does an Axios Interceptor help in front-end API management?",
      options: ["It renders UI modal alerts automatically", "It intercepts requests or responses before they are handled, useful for adding auth tokens or globally handling errors", "It connects database tables", "It accelerates image loading"],
      correct: 1,
      explanation: "Axios interceptors let you run code or modify requests/responses (e.g., adding `Bearer <token>` to request headers or checking for 401 errors globally) before passing them to then/catch blocks."
    },
    {
      q: "What is Docker containerization?",
      options: ["A database indexing methodology", "Packaging an application and its dependencies into a standardized unit (container) that runs consistently on any OS", "A file compression tool", "A cloud server load balancer"],
      correct: 1,
      explanation: "Docker bundles application code, runtime, system libraries, and settings together so that the application executes exactly the same way on a local laptop, staging, and production servers."
    },
    {
      q: "In a MERN application, how should the frontend securely handle a session token?",
      options: ["Write it in public source code comments", "Store it in an HttpOnly cookie or secure session memory, avoiding localStorage if highly sensitive to XSS", "Store it in database global variables", "Write it on the window.name property"],
      correct: 1,
      explanation: "HttpOnly cookies are inaccessible to JavaScript, protecting tokens from Cross-Site Scripting (XSS) attacks. LocalStorage is easy to use but vulnerable to script injections."
    },
    {
      q: "What does database 'seeding' mean?",
      options: ["Deleting database history files", "Populating a database with initial placeholder or default data for development and testing", "Encrypting schema records", "Exporting server logs"],
      correct: 1,
      explanation: "Seeding is the process of putting dummy or initial setup data (like default admin users, product lists, or configuration rules) into a newly initialized database."
    },
    {
      q: "What is the primary difference between REST APIs and GraphQL?",
      options: ["REST is only for SQL, GraphQL is NoSQL", "REST uses multiple endpoints returning fixed data shapes; GraphQL uses a single endpoint allowing clients to query specific fields", "GraphQL doesn't use HTTP requests", "REST does not support authentication"],
      correct: 1,
      explanation: "GraphQL allows the client to request precisely the fields they need, reducing over-fetching and under-fetching. REST utilizes structured resources mapped to individual endpoint URLs."
    },
    {
      q: "What is a reverse proxy like Nginx used for in full-stack deployments?",
      options: ["To compile React apps", "To act as an intermediary routing requests, handling SSL termination, and caching assets before hitting the Express server", "To seed MongoDB collections", "To host local git repositories"],
      correct: 1,
      explanation: "Nginx acts as a reverse proxy by receiving external requests and forwarding them to local Express applications, managing load balancing, SSL encryption, and serving static React build files directly."
    },
    {
      q: "In MongoDB, what does the '$lookup' aggregation stage do?",
      options: ["Performs a text search in indexes", "Performs a left outer join to another collection in the same database to combine document fields", "Deletes matching database records", "Sorts collections by creation date"],
      correct: 1,
      explanation: "$lookup performs an equality join from a target collection, adding matched sub-documents into an array field of the input document."
    },
    {
      q: "Why is a CI/CD pipeline critical for modern software delivery?",
      options: ["It styles frontend pages", "It automates building, testing, and deploying code changes, reducing manual errors and feedback cycles", "It generates SQL schemas", "It monitors mouse cursor hover rates"],
      correct: 1,
      explanation: "Continuous Integration/Continuous Deployment (CI/CD) automates regression testing and server deployments, ensuring that any code merged into main is immediately built and pushed to servers."
    },
    {
      q: "What is Redis caching, and where is it located in a full stack stack?",
      options: ["A browser storage index", "An in-memory key-value data store used as a cache database between the Express server and MongoDB", "A node styling framework", "An encrypted email server"],
      correct: 1,
      explanation: "Redis is an extremely fast in-memory store. By caching frequently accessed database queries in Redis, the server can return results instantly without querying MongoDB over the network."
    },
    {
      q: "What does standard Git 'Rebase' do compared to 'Merge'?",
      options: ["Deletes the commits entirely", "Integrates changes from one branch into another by moving the branch base, creating a linear history; Merge combines branches with a merge commit", "Sends code directly to production", "Reorders line layouts"],
      correct: 1,
      explanation: "Rebase reapplies commits on top of another base tip, maintaining a clean, linear project history. Merge joins the branches together and creates a dedicated merge commit."
    },
    {
      q: "What is the purpose of environment variables (.env files)?",
      options: ["To specify CSS style configurations", "To store sensitive secrets (API keys, DB URIs) outside of the source code, separating configuration from code", "To script HTML markup tags", "To map DOM actions"],
      correct: 1,
      explanation: "Using environment variables ensures security credentials, ports, and external API links are not hardcoded into version control repositories."
    },
    {
      q: "How does a standard React routing system (React Router DOM) work under the hood?",
      options: ["By reloading the browser window on every link click", "By intercepting URL changes and rendering corresponding components client-side without full-page refreshes", "By downloading server files dynamically", "By executing database lookups directly"],
      correct: 1,
      explanation: "React Router DOM performs client-side routing. It intercepts browser history events and toggles React components, creating a Single Page Application (SPA) experience."
    }
  ],
  "python": [
    {
      q: "What is a decorator in Python?",
      options: ["A built-in GUI theme library", "A function that takes another function as an argument, extending its behavior without modifying it explicitly", "A code formatting parser tool", "A comment styling standard"],
      correct: 1,
      explanation: "Decorators wrap another function in Python to extend or modify its execution behavior. They are denoted with the @ symbol (e.g., @classmethod or custom loggers)."
    },
    {
      q: "What is a generator function in Python?",
      options: ["A function that compiles C code", "A function that returns an iterator using the 'yield' keyword to produce values lazily one-by-one", "A script that generates random data", "A class instantiation constructor"],
      correct: 1,
      explanation: "Generators use 'yield' instead of 'return'. They generate values on-the-fly when requested, which is memory-efficient for processing large data streams."
    },
    {
      q: "What is the primary difference between a list and a tuple in Python?",
      options: ["Lists are immutable; tuples are mutable", "Lists are mutable; tuples are immutable", "Tuples are only for strings", "Lists run faster in memory"],
      correct: 1,
      explanation: "Lists can be modified after creation (mutable), whereas tuples cannot be modified once created (immutable). Tuples are declared with parentheses `(1, 2)` and lists with brackets `[1, 2]`."
    },
    {
      q: "How does NumPy utilize vectorization for performance?",
      options: ["By executing processes on GPU cores", "By performing operations on arrays without explicit for-loops, writing operations in compiled C code", "By storing values as JSON lists", "By running threads dynamically"],
      correct: 1,
      explanation: "NumPy arrays are contiguous blocks of memory processed via vectorization. Mathematical calculations are passed to pre-compiled C routines, avoiding Python loop overhead."
    },
    {
      q: "In Pandas, what does the 'groupby()' function do?",
      options: ["Deletes null database entries", "Splits the data into groups based on some criteria, allowing aggregation operations on each group", "Sorts the DataFrame in descending order", "Pivots column layouts"],
      correct: 1,
      explanation: "groupby() splits a DataFrame, applies aggregation functions (like mean, sum, count), and combines the results back into a clean structure."
    },
    {
      q: "What does list comprehension in Python provide?",
      options: ["A way to parse HTML lists", "A concise, readable syntax for creating new lists based on existing lists/iterables", "A script to compile C libraries", "A security checker tool"],
      correct: 1,
      explanation: "List comprehensions offer a short syntax to create lists: `[x*2 for x in my_list if x > 0]` replacing multiple lines of nested loops."
    },
    {
      q: "How does Python handle memory management?",
      options: ["Manually via malloc and free statements", "Automatically via reference counting and a generational Garbage Collector", "By exporting files to disk swap", "Through web browser caching rules"],
      correct: 1,
      explanation: "Python dynamically manages memory. It tracks reference counts of objects. If references hit zero, it frees memory, and also runs a generational garbage collector to clear reference cycles."
    },
    {
      q: "What is the purpose of `__init__.py` files in Python directories?",
      options: ["To run a script on startup", "To mark directories on disk as Python packages", "To write custom class decorators", "To reset variable definitions"],
      correct: 1,
      explanation: "In Python 3 (and required in older versions), placing `__init__.py` inside a folder makes it importable as a module package."
    },
    {
      q: "What is the difference between `is` and `==` in Python?",
      options: ["`is` checks value equality; `==` checks identity", "`is` checks identity (same memory address); `==` checks value equality", "They are exact synonyms", "One is only for integers"],
      correct: 1,
      explanation: "`==` checks if two values are equal (e.g. `[1,2] == [1,2]` is True), whereas `is` checks if they point to the exact same object in memory (identity)."
    },
    {
      q: "What is the Global Interpreter Lock (GIL) in Python?",
      options: ["A security lock preventing unauthorized imports", "A mutex that protects access to Python objects, preventing multiple threads from executing Python bytecodes at once", "A database authentication module", "A server port blocking feature"],
      correct: 1,
      explanation: "The GIL is a mutex in the standard CPython implementation that prevents multi-threaded Python scripts from taking full advantage of multi-core CPUs for CPU-bound tasks."
    },
    {
      q: "Which keyword is used to handle cleanups (like closing files or database connections) regardless of exceptions in Python?",
      options: ["except", "finally", "else", "ensure"],
      correct: 1,
      explanation: "Code block inside the `finally` statement of a `try...except...finally` block will always run, making it ideal for clean-ups and closing resources."
    },
    {
      q: "What does the `*args` and `**kwargs` syntax represent in Python function definitions?",
      options: ["Required system pointers", "Variables for positional arguments (*args) and keyword arguments (**kwargs) passed dynamically to a function", "Array slicing ranges", "Mathematical exponents"],
      correct: 1,
      explanation: "`*args` allows a function to accept any number of positional arguments as a tuple. `**kwargs` allows accepting any number of keyword arguments as a dictionary."
    },
    {
      q: "In Python, how do you handle JSON formatting conversions?",
      options: ["Using the regex split functions", "Using the built-in `json` module with `json.dumps()` (to string) and `json.loads()` (to dict)", "Through third-party CSS imports", "By casting strings to tuple lists"],
      correct: 1,
      explanation: "The standard library's `json` module provides `dumps` to serialize Python dicts to JSON strings and `loads` to parse JSON strings back to dict objects."
    },
    {
      q: "What is a virtual environment in Python and why is it useful?",
      options: ["A browser simulator tool", "An isolated workspace that contains its own Python binary and libraries, preventing version conflicts between projects", "An encrypted cloud sandbox", "A server virtualization platform"],
      correct: 1,
      explanation: "Virtual environments (`venv` or `conda`) keep project dependencies separated, ensuring installing updates for one project doesn't break dependencies in another."
    }
  ],
  "data analyst": [
    {
      q: "Which SQL clause is used to filter records AFTER an aggregation has been performed in a GROUP BY?",
      options: ["WHERE", "HAVING", "ORDER BY", "FILTER"],
      correct: 1,
      explanation: "`WHERE` is used to filter records before groups are formed. `HAVING` filters aggregated values created by the GROUP BY clause."
    },
    {
      q: "What is a Pivot Table in Microsoft Excel?",
      options: ["A formula that performs search lookups", "An interactive summary table that automatically groups, sums, or averages large datasets", "A layout grid of CSS styled cells", "An encrypted security sheet"],
      correct: 1,
      explanation: "Pivot tables allow users to dynamically reorganize, summarize, and filter rows/columns of data without writing complex math formulas."
    },
    {
      q: "In DAX (Power BI), what is the difference between calculated columns and measures?",
      options: ["Calculated columns are evaluated on the fly; measures are pre-calculated during import", "Calculated columns are computed row-by-row and stored in memory; measures are aggregated calculations computed dynamically during query evaluation", "Calculated columns do not use math operations", "Measures are only for counting text strings"],
      correct: 1,
      explanation: "Calculated columns use RAM storage and recalculate on data refresh. Measures are calculated dynamically when you interact with visualizations, taking up no database storage."
    },
    {
      q: "What is the definition of standard deviation in statistics?",
      options: ["The difference between maximum and minimum values", "A measure of the dispersion or spread of data points relative to their mean average", "The middle value of a sorted list", "The average of all values squared"],
      correct: 1,
      explanation: "Standard deviation quantifies how much the values in a dataset deviate from the mean. A low SD means data points are clustered close to the mean."
    },
    {
      q: "How does a standard SQL LEFT JOIN work?",
      options: ["It returns only the records that have matches in both tables", "It returns all records from the left table, and the matched records from the right table (with NULLs if no match)", "It returns only records that have no relationships", "It deletes duplicate records from both tables"],
      correct: 1,
      explanation: "A LEFT JOIN guarantees all rows from the left table are returned. If a left row has no match in the right table, the resulting columns from the right table are populated with NULL values."
    },
    {
      q: "In Pandas, how do you merge two DataFrames on a common column index?",
      options: ["pd.concat()", "pd.merge(df1, df2, on='column_name')", "df1.join_columns(df2)", "df1 + df2"],
      correct: 1,
      explanation: "The `pd.merge()` function allows SQL-like joins on specified key columns. `pd.concat()` is typically used to stack DataFrames vertically or horizontally."
    },
    {
      q: "What is the difference between correlation and causation?",
      options: ["Correlation is always stronger than causation", "Correlation indicates a relationship or pattern between two variables; causation means one variable directly causes the other to change", "Correlation is only for negative numbers", "They are statistical synonyms"],
      correct: 1,
      explanation: "A correlation shows that two variables move together, but it doesn't prove that one causes the other. Causation requires testing/experiments to establish a direct cause-and-effect link."
    },
    {
      q: "What is data 'imputation' in data preprocessing?",
      options: ["Encrypting user email lists", "Replacing missing data values with substituted statistical values (like mean, median, or mode)", "Deleting columns with text fields", "Compressing files to zip folder format"],
      correct: 1,
      explanation: "Imputation is a method of handling missing data by filling it in with calculated estimates, avoiding dropping records and losing valuable dataset sample size."
    },
    {
      q: "What does Excel VLOOKUP do?",
      options: ["Pivots row heights", "Searches for a value in the first column of a range, and returns a value in the same row from a specified column", "Sorts table rows alphabetically", "Graphs data in line charts"],
      correct: 1,
      explanation: "VLOOKUP stands for Vertical Lookup. It searches down the leftmost column of a table array for a search key, then retrieves data from a specified column offset."
    },
    {
      q: "Which type of chart is best suited to display the distribution of a single numerical variable?",
      options: ["Line Chart", "Bar Chart of categories", "Histogram", "Pie Chart"],
      correct: 2,
      explanation: "A histogram groups continuous numerical data into bins and plots the frequency of data points in each bin, displaying the shape of the dataset distribution."
    },
    {
      q: "What does the statistical term 'outlier' mean?",
      options: ["A value that matches the dataset average perfectly", "An observation point that is distant or significantly different from other observations in the dataset", "A dataset column that contains text values", "A variable index identifier"],
      correct: 1,
      explanation: "Outliers are data points that lie abnormal distances from other values, often caused by measurement errors or rare, extreme events."
    },
    {
      q: "In database design, what is a primary key?",
      options: ["An encrypted login token", "A column or set of columns that uniquely identifies each row in a database table", "An access password key", "A database backup index"],
      correct: 1,
      explanation: "A primary key constraint guarantees that values in the specified column are unique and NOT NULL, establishing an identity for every record."
    },
    {
      q: "What is the purpose of Data Normalization in database design?",
      options: ["To add styling elements", "To organize tables to minimize data redundancy and dependency issues", "To merge all databases into one sheet", "To compress binary images"],
      correct: 1,
      explanation: "Normalization splits large tables into smaller, linked tables to prevent update anomalies, save storage, and enforce database structural integrity."
    },
    {
      q: "What is DAX in Power BI?",
      options: ["A styling stylesheet", "Data Analysis Expressions; a formula language used to create custom calculations, tables, and measures", "A server port router", "An automated database driver"],
      correct: 1,
      explanation: "DAX is the formula language used in Power BI, Power Pivot, and Analysis Services to perform custom analytics and statistical calculations on data models."
    }
  ],
  "machine learning": [
    {
      q: "What is the difference between supervised and unsupervised learning?",
      options: ["Supervised has labelled target data; unsupervised works on unlabelled data to find patterns", "Supervised uses GPUs; unsupervised uses CPUs", "Supervised is for SQL; unsupervised is for NoSQL", "Supervised is manual coding; unsupervised is automatic"],
      correct: 0,
      explanation: "Supervised learning trains models on input-output pairs to predict target values. Unsupervised learning groups data based on features without target labels (e.g., clustering)."
    },
    {
      q: "Which machine learning algorithm is commonly used for classification based on the majority vote of K-nearest data points?",
      options: ["Linear Regression", "K-Nearest Neighbors (KNN)", "K-Means Clustering", "Support Vector Machines"],
      correct: 1,
      explanation: "KNN is a simple, instance-based supervised classifier that labels data points based on the class labels of their closest neighbors in feature space."
    },
    {
      q: "What is the primary risk of overfitting a machine learning model?",
      options: ["The model runs extremely slow in production", "The model performs very well on training data but poorly on unseen test data", "The model deletes database records", "The model requires constant internet connection"],
      correct: 1,
      explanation: "Overfitting occurs when a model learns the noise and details of the training data too well, failing to generalize to new, unseen evaluation datasets."
    },
    {
      q: "In Scikit-learn, what is the purpose of the 'fit()' method?",
      options: ["To export models to JSON files", "To train the model on inputs and targets to learn parameters", "To predict target outputs", "To scale page layout coordinates"],
      correct: 1,
      explanation: "The fit() method executes the training algorithms, calculating model weights, coefficients, or cluster centroids based on the training dataset provided."
    },
    {
      q: "What does Cross-Validation (e.g., K-Fold) help prevent or evaluate?",
      options: ["It prevents system memory leaks", "It provides a robust estimate of model generalization performance and helps detect overfitting", "It speeds up database write speeds", "It compiles code into assembly"],
      correct: 1,
      explanation: "K-Fold cross-validation splits the data into K subsets, training K times on K-1 folds and testing on the remaining fold, ensuring every data point is used for validation."
    },
    {
      q: "What is Gradient Descent in machine learning?",
      options: ["An algorithm to sort list arrays", "An optimization algorithm used to minimize a cost function by iteratively moving in the direction of steepest descent", "A neural network layer layout", "A data cleaning script"],
      correct: 1,
      explanation: "Gradient descent calculates the gradient of the loss function, adjusting model weights in small steps (learning rate) to find the local/global minimum loss."
    },
    {
      q: "Which metric is best suited to evaluate classification models when false negatives are extremely costly (e.g., medical diagnostics)?",
      options: ["Accuracy", "Precision", "Recall (Sensitivity)", "R-squared"],
      correct: 2,
      explanation: "Recall measures the proportion of actual positives correctly identified: True Positives / (True Positives + False Negatives). High recall means low false negatives."
    },
    {
      q: "What is a confusion matrix?",
      options: ["A database link error", "A table layout displaying True Positives, False Positives, True Negatives, and False Negatives of a classifier", "A complex matrix algebra formula", "A neural network coding bug"],
      correct: 1,
      explanation: "A confusion matrix summarizes classifier predictions against actual ground-truth labels, allowing analysis of specific error types."
    },
    {
      q: "What is the purpose of feature scaling (like normalization or standardization)?",
      options: ["To reduce code length", "To bring all continuous feature variables to a similar numerical scale, preventing features with larger values from dominating calculations", "To compress database images", "To style dashboard charts"],
      correct: 1,
      explanation: "Distance-based models (like KNN, SVM, K-Means) and gradient-based models converge faster and perform better when features are on equivalent scales."
    },
    {
      q: "What is the Bias-Variance tradeoff in machine learning?",
      options: ["Trading algorithm speed for accuracy", "Balancing errors from simple assumptions (high bias) against errors from sensitivity to training noise (high variance)", "Choosing between SQL and NoSQL databases", "Adjusting screen brightness styles"],
      correct: 1,
      explanation: "Simple models have high bias / low variance. Complex models have low bias / high variance. The goal is to find the sweet spot minimizing total error."
    },
    {
      q: "What is Random Forest?",
      options: ["A random folder organization structure", "An ensemble learning method that constructs multiple decision trees and merges their outputs for classification/regression", "A neural network layer compiler", "A data preprocessing tool"],
      correct: 1,
      explanation: "Random Forest builds many independent decision trees using bootstrap bagging and random feature selection, averaging predictions to reduce variance and overfitting."
    },
    {
      q: "What is K-Means?",
      options: ["A supervised classifier", "An unsupervised clustering algorithm that partitions data into K distinct clusters based on feature centroids", "A regression algorithm", "A deep neural network library"],
      correct: 1,
      explanation: "K-Means is an iterative clustering algorithm that assigns data points to the nearest of K centroids, updating centroids based on cluster means until convergence."
    },
    {
      q: "What is a Support Vector Machine (SVM)?",
      options: ["A server hardware platform", "A supervised model that finds the hyperplane that maximizes the margin distance between classification classes", "A neural network compilation compiler", "A database indexing script"],
      correct: 1,
      explanation: "SVM maps data to high-dimensional space and finds an optimal boundary plane maximizing spacing between the nearest data points (support vectors) of different classes."
    },
    {
      q: "What does the R-squared metric represent in regression analysis?",
      options: ["The speed of model calculation", "The proportion of variance in the dependent variable that is predictable from the independent variables", "The number of regression columns", "The error variance standard deviation"],
      correct: 1,
      explanation: "R-squared (coefficient of determination) measures how well the regression predictions approximate the actual data points, ranging from 0 to 1."
    }
  ],
  "ai engineer": [
    {
      q: "What is the attention mechanism in Transformers?",
      options: ["A memory buffer system", "A mechanism that calculates mathematical relevance weights between words, allowing models to focus on context regardless of distance", "A model training speed optimizer", "An image filtering library"],
      correct: 1,
      explanation: "Self-attention computes key, query, and value representations for each token, allowing the model to weigh relations between all words in a sentence dynamically."
    },
    {
      q: "What is the difference between an Encoder-only model (e.g. BERT) and a Decoder-only model (e.g. GPT)?",
      options: ["BERT uses GPUs; GPT uses CPUs", "BERT is for understanding context from both directions; GPT is for autoregressive text generation predicting the next token", "BERT does not use tokens", "GPT does not use neural networks"],
      correct: 1,
      explanation: "BERT is bidirectional, making it ideal for tasks like classification and named entity recognition. GPT is causal/autoregressive, generating text sequence by predicting subsequent words."
    },
    {
      q: "What is Prompt Engineering Few-Shot Learning?",
      options: ["Training a neural network with few images", "Providing a few input-output examples inside the text prompt to guide the LLM's response style", "Reducing the number of transformer layers", "Using minor command-line parameters"],
      correct: 1,
      explanation: "Few-shot prompting shows the model examples of the desired task, helping it understand the output format and logic without weight adjustments."
    },
    {
      q: "What is a Vector Database (like Pinecone or Chroma) used for in AI applications?",
      options: ["To compile C++ mathematical files", "To store and perform fast similarity searches on high-dimensional vectors (embeddings) generated by AI models", "To store relational SQL schemas", "To cache website assets"],
      correct: 1,
      explanation: "Vector databases index embeddings. They calculate mathematical distances (e.g., Cosine similarity) to perform semantic search, which is crucial for RAG architectures."
    },
    {
      q: "What is RAG (Retrieval-Augmented Generation)?",
      options: ["An automated code debugging tool", "A framework that retrieves relevant documents from an external data source and injects them into the LLM prompt to ground answers", "A neural network training optimizer", "An image style filter"],
      correct: 1,
      explanation: "RAG combines retrieval systems (semantic vector databases) with generative LLMs, supplying private or up-to-date facts to ensure accurate, hallucination-free outputs."
    },
    {
      q: "In neural networks, what is the role of an activation function (like ReLU or Sigmoid)?",
      options: ["To delete inactive weight parameters", "To introduce non-linearities into the network, allowing it to learn complex non-linear patterns", "To allocate RAM buffer size", "To print calculation logs"],
      correct: 1,
      explanation: "Without activation functions, stacking multiple linear layers results in a simple linear model. Functions like ReLU allow learning complex mathematical functions."
    },
    {
      q: "What does the 'temperature' parameter control in LLM text generation?",
      options: ["The temperature of server CPUs", "The randomness and creativity of the generated output text", "The token speed rate limit", "The neural network layer count"],
      correct: 1,
      explanation: "Lower temperatures (e.g., 0.1) yield deterministic, focused responses. Higher temperatures (e.g., 0.8) increase output randomness, diversity, and creativity."
    },
    {
      q: "What is tokenization in natural language processing?",
      options: ["Creating database security tokens", "Breaking down raw text strings into smaller units (tokens) like words, subwords, or characters for model parsing", "Formatting code style brackets", "Compressing files into binary bytes"],
      correct: 1,
      explanation: "Tokenization processes text into integer IDs that map to a pre-defined vocabulary list, which the neural network can then ingest as numerical tensors."
    },
    {
      q: "In PyTorch, what is a tensor?",
      options: ["A network socket communication port", "A multi-dimensional numerical array container optimized for GPU acceleration and automatic differentiation", "A custom text input component", "A file database index"],
      correct: 1,
      explanation: "Tensors are the fundamental data structures in PyTorch, similar to NumPy ndarrays but capable of running on graphics cards and tracking gradients."
    },
    {
      q: "What is the purpose of fine-tuning an LLM?",
      options: ["To adjust monitor color scales", "To train a pre-trained model on a smaller, domain-specific dataset to adapt its style, behavior, or domain knowledge", "To rewrite python packages from scratch", "To speed up internet routers"],
      correct: 1,
      explanation: "Fine-tuning takes a foundation model (e.g. LLaMA) and updates its weights on custom datasets to perform specific downstream tasks (like customer support or medical analysis)."
    },
    {
      q: "What does RLHF (Reinforcement Learning from Human Feedback) accomplish?",
      options: ["It automates unit testing code", "It aligns LLM generation safety and helpfulness with human preferences using reward modeling", "It designs web layouts automatically", "It compiles server-side routing"],
      correct: 1,
      explanation: "RLHF trains a reward model based on human rankings of model responses, then optimizes the generative LLM using reinforcement learning (PPO) to maximize human alignment."
    },
    {
      q: "What does a Transformer's positional encoding do?",
      options: ["It styles text page coordinate alignments", "It injects information about the order/position of words in a sequence since transformers process tokens in parallel", "It encrypts secure token IDs", "It indexes relational database rows"],
      correct: 1,
      explanation: "Unlike sequential models (RNNs), Transformers process all tokens at once. Positional encodings add trigonometric vectors to token embeddings to indicate word ordering."
    },
    {
      q: "What is the primary difference between training a model from scratch vs using transfer learning?",
      options: ["Transfer learning is only for SQL databases", "Transfer learning starts with weights pre-trained on a massive dataset, requiring far less data and compute to achieve high accuracy", "Training from scratch is always free", "Transfer learning has no mathematical layers"],
      correct: 1,
      explanation: "Transfer learning utilizes pre-learned feature extractors (like ImageNet weights or LLM foundations), tuning only the final layers, saving weeks of compute."
    },
    {
      q: "What is LangChain?",
      options: ["A language translation compiler", "A popular software framework designed to simplify creating applications using large language models", "A secure blockchain ledger", "A backend server database"],
      correct: 1,
      explanation: "LangChain provides abstractions (chains, prompt templates, memory, agents) to link LLMs with external data sources, calculators, and API interfaces."
    }
  ],
  "cloud engineer": [
    {
      q: "What is AWS S3?",
      options: ["An EC2 compute container server", "Simple Storage Service; an object storage service offering industry-leading scalability, data availability, security, and performance", "A relational SQL server", "A domain name system router"],
      correct: 1,
      explanation: "Amazon S3 is object storage, storing files (images, backups, static websites) as objects in buckets, accessed via URLs, rather than file block systems."
    },
    {
      q: "In cloud computing, what does 'Serverless' (e.g. AWS Lambda) mean?",
      options: ["There are no physical servers involved in the infrastructure", "Developers write code functions and the cloud provider automatically manages the underlying server scaling and provisioning", "The databases are saved offline on local disks", "The server runs without internet connection"],
      correct: 1,
      explanation: "Serverless code runs in response to events. You do not manage virtual machines; you only pay for the exact millisecond compute duration your code executes."
    },
    {
      q: "What is the purpose of an AWS IAM Role?",
      options: ["To style user dashboards", "To grant secure, temporary permissions to AWS resources and services without sharing long-term credentials", "To configure server firewalls", "To index database collections"],
      correct: 1,
      explanation: "Identity and Access Management (IAM) Roles define sets of permissions that services or users can assume dynamically to interact securely with AWS APIs."
    },
    {
      q: "What is an AWS EC2 Instance?",
      options: ["An object storage bucket", "A virtual machine in the cloud providing resizable compute capacity", "A serverless function script", "A managed relational database engine"],
      correct: 1,
      explanation: "Elastic Compute Cloud (EC2) provides secure, resizable virtual server instances in the cloud, allowing you to configure operating systems, RAM, and storage volumes."
    },
    {
      q: "What is Infrastructure as Code (IaC) and name a common tool used for it?",
      options: ["Designing CSS styles; Bootstrap", "Managing and provisioning cloud infrastructure using machine-readable configuration files; Terraform", "Writing SQL seeds; MySQL", "Creating website animations; Framer Motion"],
      correct: 1,
      explanation: "IaC treats infrastructure the same way as application code, versioning it in Git. Terraform and CloudFormation allow spinning up servers, networks, and databases using declarative configs."
    },
    {
      q: "What is the function of a Load Balancer in cloud architecture?",
      options: ["To compress static image assets", "To distribute incoming application traffic across multiple target servers to ensure reliability and fault tolerance", "To encrypt database connections", "To compile react routes client-side"],
      correct: 1,
      explanation: "Load balancers (like AWS ALB) monitor backend server health and distribute requests evenly, preventing any single server from becoming overloaded."
    },
    {
      q: "What is a VPC (Virtual Private Cloud)?",
      options: ["A virtual machine compiler", "A logically isolated virtual network dedicated to your AWS account, allowing you to run resources in defined subnets", "An encrypted blockchain ledger", "A file transfer protocol socket"],
      correct: 1,
      explanation: "A VPC gives you complete control over your virtual networking environment, including IP address ranges, subnets, route tables, and network gateways."
    },
    {
      q: "In Kubernetes, what is a Pod?",
      options: ["A cloud storage bucket", "The smallest deployable unit of computing that can be created and managed in Kubernetes, representing a single running process", "A physical server rack", "A database table query"],
      correct: 1,
      explanation: "A Pod contains one or more containers (such as Docker containers) that share network and storage resources, running together on a cluster node."
    },
    {
      q: "What is a Content Delivery Network (CDN) like AWS CloudFront used for?",
      options: ["To compile database files", "To cache and deliver static content globally from edge locations close to users, reducing latency", "To secure server logins", "To route email servers"],
      correct: 1,
      explanation: "CDNs cache static assets (HTML, CSS, JS, images) in server nodes around the world. Users download assets from the nearest edge server, accelerating loads."
    },
    {
      q: "What is the difference between a public subnet and a private subnet in a cloud VPC?",
      options: ["Public subnets are free; private subnets are paid", "Public subnets have a direct route to the Internet Gateway; private subnets do not, securing internal database instances", "Public subnets have no security settings", "Private subnets are located offline"],
      correct: 1,
      explanation: "Public subnets route outbound traffic to an internet gateway, allowing public IP access. Private subnets host databases or backends, reaching internet only via NAT gateways."
    },
    {
      q: "What does Auto Scaling accomplish?",
      options: ["Resizes browser windows to fit displays", "Dynamically adjusts the number of active virtual servers based on demand metrics like CPU utilization", "Sorts SQL rows automatically", "Updates software packages daily"],
      correct: 1,
      explanation: "Auto Scaling launches or terminates server instances automatically based on user-defined alerts (e.g., scale up if CPU usage is > 70% for 5 minutes)."
    },
    {
      q: "What is the purpose of AWS Route 53?",
      options: ["To store video files", "A highly available and scalable Cloud Domain Name System (DNS) web service", "A server firewall route router", "An automated database backup system"],
      correct: 1,
      explanation: "Route 53 performs DNS lookup, converting human-friendly URLs (www.primeai.com) into numerical IP addresses (192.0.2.1) to connect requests."
    },
    {
      q: "What is CI/CD Deployment Blue/Green strategy?",
      options: ["Using green text themes", "Maintaining two identical production environments (Blue and Green), deploying updates to the inactive one, then swapping traffic to reduce downtime", "Compiling python code to C", "Deleting old logs"],
      correct: 1,
      explanation: "Blue/Green deployment provides rapid rollback if bugs are discovered, since the old environment (Blue) remains fully functional while traffic is routed to Green."
    },
    {
      q: "What does 'High Availability' (HA) mean in cloud design?",
      options: ["The server has extremely fast internet speeds", "A system designed to operate continuously without single points of failure, often spanning multiple availability zones", "The storage space is unlimited", "The website has high SEO rank"],
      correct: 1,
      explanation: "HA systems use redundant nodes and automatic failover across different geographical datacenters (Availability Zones) to guarantee minimum system uptime (e.g. 99.99%)."
    }
  ]
};

// 3. AI Scoring and Roadmap Rules Engine
// Takes resume information and calculates scores, strengths, weaknesses, and roadmap.
function analyzeResumeAI(skillsInput = [], projectsInput = [], experienceInput = "", educationInput = "") {
  let score = 50; // Base score
  let ats = 45;
  let readiness = 40;

  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  const skills = skillsInput.map(s => s.toLowerCase().trim());
  const projects = projectsInput || [];
  
  // Rule 1-10: Skill Count Rules
  if (skills.length > 0) {
    score += Math.min(skills.length * 3, 24);
    ats += Math.min(skills.length * 3, 20);
    readiness += Math.min(skills.length * 3, 20);
    strengths.push(`Detected a solid set of ${skills.length} technical skills.`);
  } else {
    weaknesses.push("No core technical skills were identified.");
    suggestions.push("Add a dedicated 'Skills' section listing tools, languages, and frameworks.");
  }

  // Rule 11-20: Project Count Rules
  if (projects.length >= 2) {
    score += 15;
    ats += 15;
    readiness += 15;
    strengths.push(`Strong portfolio with ${projects.length} detailed projects.`);
  } else if (projects.length === 1) {
    score += 8;
    ats += 8;
    readiness += 8;
    strengths.push("Has at least one project detailed in the profile.");
    weaknesses.push("Single project profile. Employers look for multiple project demonstrations.");
    suggestions.push("Add at least one more project showing a different tech stack (e.g. backend integration).");
  } else {
    weaknesses.push("No projects are listed in the resume.");
    suggestions.push("Incorporate detailed projects describing your role, tech stack, and measurable impact.");
  }

  // Rule 21-30: Project descriptions rules
  let descriptiveProjects = 0;
  projects.forEach(p => {
    if (p.description && p.description.length > 50) {
      descriptiveProjects++;
    }
  });
  if (descriptiveProjects > 0) {
    score += 5;
    ats += 5;
  } else if (projects.length > 0) {
    weaknesses.push("Project descriptions are too brief or lacking implementation detail.");
    suggestions.push("Expand project descriptions using the STAR method (Situation, Task, Action, Result).");
  }

  // Rule 31-40: Experience Rules
  if (experienceInput && experienceInput.trim().length > 10) {
    score += 10;
    ats += 15;
    readiness += 15;
    strengths.push("Professional experience or internship experience is listed.");
  } else {
    weaknesses.push("No work experience or internship history detected.");
    suggestions.push("Include any freelance work, college leadership roles, or internships to demonstrate real-world team context.");
  }

  // Rule 41-50: Education Rules
  if (educationInput && educationInput.trim().length > 5) {
    score += 6;
    ats += 5;
    strengths.push("Education credentials listed.");
  } else {
    weaknesses.push("No education history was provided.");
    suggestions.push("Specify your degree, college, major, and graduation year.");
  }

  // Rule 51-60: Standard professional keyword detections
  const hasGit = skills.includes("git") || skills.includes("github");
  const hasDb = skills.includes("mongodb") || skills.includes("mysql") || skills.includes("postgresql") || skills.includes("sql");
  const hasCloud = skills.includes("aws") || skills.includes("docker") || skills.includes("cloud");

  if (hasGit) {
    score += 5;
    ats += 5;
  } else {
    weaknesses.push("Version control (Git/GitHub) is missing.");
    suggestions.push("Learn Git command basics and highlight your GitHub repository profile link.");
  }

  if (hasDb) {
    score += 5;
  } else {
    weaknesses.push("Database management systems missing from core skills.");
    suggestions.push("Acquire knowledge in at least one Relational (SQL) or Document (NoSQL) database.");
  }

  // Cap scores to maximum 100
  score = Math.min(score, 100);
  ats = Math.min(ats, 100);
  readiness = Math.min(readiness, 100);

  // Recommendations mapping (Rule 61-70)
  const recommendedCertifications = [];
  const recommendedTechnologies = [];

  if (skills.includes("react") || skills.includes("javascript")) {
    recommendedCertifications.push("Meta Front-End Developer Certificate", "freeCodeCamp Responsive Web Design");
    recommendedTechnologies.push("TypeScript", "Next.js", "Redux Toolkit");
  }
  if (skills.includes("node.js") || skills.includes("express.js") || dbSkillsCount(skills) > 0) {
    recommendedCertifications.push("MongoDB Associate Developer", "AWS Certified Developer - Associate");
    recommendedTechnologies.push("PostgreSQL", "Docker", "GraphQL", "Redis");
  }
  if (skills.includes("python") || skills.includes("tensorflow") || skills.includes("pytorch")) {
    recommendedCertifications.push("Google Professional Machine Learning Engineer", "DeepLearning.AI TensorFlow Developer");
    recommendedTechnologies.push("Scikit-Learn", "FastAPI", "Pandas", "Pinecone");
  }
  if (recommendedCertifications.length === 0) {
    recommendedCertifications.push("CompTIA Security+", "AWS Cloud Practitioner");
    recommendedTechnologies.push("Python", "Git", "SQL");
  }

  // Deduplicate
  const missingSkills = [];
  const allCoreTech = ["git", "github", "react", "node.js", "mongodb", "sql", "javascript", "tailwind css", "docker", "aws"];
  allCoreTech.forEach(tech => {
    if (!skills.includes(tech)) {
      missingSkills.push(tech.toUpperCase());
    }
  });

  return {
    resumeScore: score,
    atsScore: ats,
    readinessScore: readiness,
    strengths,
    weaknesses: weaknesses.slice(0, 4), // Cap displaying
    improvementSuggestions: suggestions.slice(0, 4),
    missingSkills: missingSkills.slice(0, 5),
    recommendedCertifications,
    recommendedTechnologies
  };
}

function dbSkillsCount(skills) {
  return skills.filter(x => ["mongodb", "mysql", "postgresql", "sql", "redis"].includes(x)).length;
}

// Rule 71-90: Career Eligibility & Roadmap Rules
function matchCareerRoleAI(userSkills = [], selectedRole = "") {
  const role = selectedRole.toLowerCase().trim();
  const requirements = ROLE_SKILL_REQUIREMENTS[role] || ["git", "python", "javascript", "sql"];
  
  const formattedUserSkills = userSkills.map(s => s.toLowerCase().trim());
  
  const matchedSkills = [];
  const missingSkills = [];

  requirements.forEach(req => {
    if (formattedUserSkills.includes(req)) {
      matchedSkills.push(req.toUpperCase());
    } else {
      missingSkills.push(req.toUpperCase());
    }
  });

  const matchedCount = matchedSkills.length;
  const totalRequired = requirements.length;
  const rawPct = totalRequired > 0 ? (matchedCount / totalRequired) * 100 : 50;
  
  // Calculate readiness and map state (Rule 81-85)
  let eligibilityScore = Math.round(rawPct);
  let readinessStatus = "Not Ready";
  
  if (eligibilityScore >= 85) {
    readinessStatus = "Interview Ready";
  } else if (eligibilityScore >= 50) {
    readinessStatus = "Almost Ready";
  }

  // Recommended supplemental skills (Rule 86-90)
  const recommendedSkills = [];
  if (role.includes("frontend") || role.includes("react")) {
    recommendedSkills.push("TYPESCRIPT", "NEXT.JS", "FESTIVAL TESTING");
  } else if (role.includes("backend") || role.includes("node")) {
    recommendedSkills.push("REDIS", "DOCKER", "GRAPHQL");
  } else if (role.includes("data") || role.includes("learning") || role.includes("ai")) {
    recommendedSkills.push("PYTORCH", "FASTAPI", "PINECONE");
  } else {
    recommendedSkills.push("DOCKER", "AWS", "LINUX");
  }

  // Generate customized Week-by-Week learning roadmap (Rule 91-100)
  const roadmap = [];
  let weekIndex = 1;

  // Add missing skills to weeks first
  missingSkills.forEach(skillName => {
    const sKey = skillName.toLowerCase();
    const tutorial = SKILL_TUTORIALS[sKey] || {
      title: `${skillName} Complete Guide`,
      url: `https://www.google.com/search?q=${encodeURIComponent(skillName + " tutorial documentation")}`,
      type: "documentation"
    };

    roadmap.push({
      week: `Week ${weekIndex}`,
      topic: skillName,
      subtopics: [
        `Introduction to ${skillName} syntax and core architecture.`,
        `Building standard layout projects or scripts using ${skillName}.`,
        `Understanding performance optimization and deployment with ${skillName}.`
      ],
      tutorials: [
        tutorial,
        {
          title: `YouTube Search: Learn ${skillName}`,
          url: `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(sKey)}+for+beginners`,
          type: "youtube"
        }
      ]
    });
    weekIndex++;
  });

  // If roadmap is short (e.g. user already has many skills), add advanced weeks
  if (roadmap.length < 3) {
    roadmap.push({
      week: `Week ${weekIndex}`,
      topic: "System Architecture & Integration",
      subtopics: ["Design patterns", "API optimization", "Caching layers", "Secure communications"],
      tutorials: [{
        title: "System Design Primer",
        url: "https://github.com/donnemartin/system-design-primer",
        type: "documentation"
      }]
    });
    weekIndex++;
    roadmap.push({
      week: `Week ${weekIndex}`,
      topic: "Portfolio Building & Mock Interviews",
      subtopics: ["Deploying final portfolio", "Completing sample resumes", "Practicing behavioral questions"],
      tutorials: [{
        title: "Mock Interview Practice",
        url: "https://react.dev/",
        type: "documentation"
      }]
    });
  }

  return {
    eligibilityScore,
    matchedSkills,
    missingSkills,
    recommendedSkills,
    readinessStatus,
    roadmap
  };
}

// Rule 101-110: Self Introduction Evaluation Rules
function gradeSelfIntroductionAI(introText = "") {
  const text = introText.toLowerCase();
  let score = 40; // Base score
  
  const checks = {
    name: false,
    education: false,
    skills: false,
    projects: false,
    goals: false,
    closing: false
  };

  // Name check rules
  if (text.includes("i am") || text.includes("my name is") || text.includes("myself") || text.includes("this is")) {
    checks.name = true;
    score += 10;
  }

  // Education check rules
  if (text.includes("university") || text.includes("college") || text.includes("degree") || text.includes("graduated") || text.includes("studying") || text.includes("btech") || text.includes("bsc") || text.includes("engineering")) {
    checks.education = true;
    score += 10;
  }

  // Skills check rules
  if (text.includes("skilled in") || text.includes("proficient") || text.includes("know") || text.includes("react") || text.includes("javascript") || text.includes("python") || text.includes("node") || text.includes("css") || text.includes("html") || text.includes("java") || text.includes("developer")) {
    checks.skills = true;
    score += 10;
  }

  // Projects check rules
  if (text.includes("project") || text.includes("built") || text.includes("created") || text.includes("developed") || text.includes("worked on") || text.includes("github")) {
    checks.projects = true;
    score += 10;
  }

  // Goals check rules
  if (text.includes("goal") || text.includes("career") || text.includes("aspiring") || text.includes("aiming") || text.includes("looking for") || text.includes("future")) {
    checks.goals = true;
    score += 10;
  }

  // Closing check rules
  if (text.includes("thank you") || text.includes("that is all") || text.includes("pleasure") || text.includes("about me")) {
    checks.closing = true;
    score += 10;
  }

  let rating = "Needs Improvement";
  let feedback = "";

  if (score >= 90) {
    rating = "Excellent";
    feedback = "Fantastic introduction! You addressed your background, education, technical skills, projects, and goals in a professional structure.";
  } else if (score >= 70) {
    rating = "Good";
    feedback = "Great start. Try to make your summary flow more naturally and ensure you explicitly describe the business value of your projects.";
  } else if (score >= 50) {
    rating = "Almost Ready";
    feedback = "Decent overview. You missed critical sections like your technical project details or clear career goals. Expand these parts.";
  } else {
    rating = "Needs Improvement";
    feedback = "Your introduction is too short or unstructured. A professional introduction should cover your name, education, core skills, projects, and closing statement.";
  }

  const idealFormat = `1. Name & Headline (e.g. "I am [Name], a passionate Full Stack Developer...")
2. Education & Credentials (e.g. "I recently completed my degree in Computer Science at [University]...")
3. Technical Skills (e.g. "I specialize in React, Node.js, and MongoDB, focus on building responsive interfaces...")
4. Core Projects (e.g. "One of my key achievements was building an AI tool which improved parsing speed by 30%...")
5. Career Goal (e.g. "I am seeking a junior role where I can contribute to backend performance...")
6. Professional Closing (e.g. "Thank you for this opportunity, I'm excited to discuss how my skills align.")`;

  return {
    score,
    confidence: score >= 80 ? "Excellent" : (score >= 60 ? "Good" : "Needs Improvement"),
    communication: score >= 85 ? "Excellent" : (score >= 65 ? "Good" : "Needs Improvement"),
    structure: score >= 90 ? "Excellent" : (score >= 70 ? "Good" : "Needs Improvement"),
    professionalism: score >= 80 ? "Excellent" : (score >= 60 ? "Good" : "Needs Improvement"),
    feedback,
    idealFormat
  };
}

module.exports = {
  ROLE_SKILL_REQUIREMENTS,
  ROLE_MCQ_BANK,
  SKILL_TUTORIALS,
  analyzeResumeAI,
  matchCareerRoleAI,
  gradeSelfIntroductionAI
};
