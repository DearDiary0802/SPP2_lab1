const port = process.env.PORT | 3000;
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var fs = require('fs');

class Task {
    id;
    name;
    description;
    status;
    file;
    deadline;

    constructor(id, name, description, status, deadline, file = null) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.file = file;
        this.deadline = deadline;
    }
}

const TaskStatus = Object.freeze({
    DONE: "Done",
    IN_PROGRESS: "In progress",
    EXPIRED: "Expired"
});

const tasksFilename = 'tasks.json';

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let task1 = new Task(1, 'SPP1', 'Pass lw1', TaskStatus.IN_PROGRESS, new Date(Date.now() + 1 * 24 * 3600 * 1000));

let obj = {
    tasks: [task1]
};

function normalizeDate() {
    obj.tasks.forEach(task => task.deadline = new Date(task.deadline));
}

if (fs.existsSync(tasksFilename)) {
    obj = readJSONFileSync(tasksFilename, 'utf8');
    normalizeDate();
    changeTaskStatus();
}

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

app.use(express.static(__dirname));

app.use(multer({storage: storageConfig}).single('task-file'));

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    changeTaskStatus();
    res.render('index', {tasks: obj.tasks, TaskStatus: TaskStatus});
});

app.get("/download/:taskId/:filename", function (req, res) {
    let path = process.cwd() + "\\uploads\\" + req.params["filename"];
    let taskId = req.params["taskId"];
    let originalName = obj.tasks.filter(v => v.id === parseInt(taskId))[0].file.originalname;
    res.download(path, originalName);
});

app.get('/*', function (req, res) {
    res.status(404).send('Not Found');
    res.end();
});

function addTask(req) {
    let taskId = obj.tasks.length + 1;
    if (!req.body['task-name']) {
        req.body['task-name'] = `New task ${taskId}`;
    }
    if (!req.body['task-deadline']) {
        req.body['task-deadline'] = new Date(Date.now() + 1 * 24 * 3600 * 1000);
    }

    const task = new Task(taskId, req.body['task-name'], req.body['task-description'], TaskStatus.IN_PROGRESS, req.body['task-deadline'], req.file);
    obj.tasks.push(task);
}

function deleteTask(req) {
    let taskId = req.body['delete-task'];
    obj.tasks = obj.tasks.filter(v => v.id !== parseInt(taskId));
}

function completeTask(req) {
    let taskId = req.body['complete-task'];
    obj.tasks.find(v => v.id === parseInt(taskId)).status = TaskStatus.DONE;
}

function getFilteredTasks(req) {
    let filteredTasks = obj.tasks;
    switch (req.body['filter']) {
        case TaskStatus.DONE:
            filteredTasks = obj.tasks.filter(v => v.status === TaskStatus.DONE);
            break;
        case TaskStatus.IN_PROGRESS:
            filteredTasks = obj.tasks.filter(v => v.status === TaskStatus.IN_PROGRESS);
            break;
        case TaskStatus.EXPIRED:
            filteredTasks = obj.tasks.filter(v => v.status === TaskStatus.EXPIRED);
            break;
    }
    return filteredTasks;
}

app.post('/', function (req, res) {
    if (!req.body)
    {
        return res.status(400).send('Not found');
    }

    if (req.body['add-task']) {

        addTask(req);

        writeJSONFileSync(tasksFilename);

        normalizeDate();
        changeTaskStatus();
        res.render('index', {tasks: obj.tasks, TaskStatus: TaskStatus});

    } else if (req.body['delete-task']) {

        deleteTask(req);

        writeJSONFileSync(tasksFilename);

        normalizeDate();
        changeTaskStatus();
        res.render('index', {tasks: obj.tasks, TaskStatus: TaskStatus});

    } else if (req.body['complete-task']) {

        completeTask(req);

        writeJSONFileSync(tasksFilename);

        normalizeDate();
        changeTaskStatus();
        res.render('index', {tasks: obj.tasks, TaskStatus: TaskStatus});

    } else if (req.body['filter-tasks']) {

        let filteredTasks = getFilteredTasks(req);
        res.render('index', {tasks: filteredTasks, TaskStatus: TaskStatus});

    } else {
        return res.status(404).send('Not Found');
    }
})

app.listen(port, function () {
    console.log(`ToDo listening on port ${port}!`);
})

function readJSONFileSync(filename, encoding) {
    let data = fs.readFileSync(filename, encoding).toString();
    return JSON.parse(data);
}

function writeJSONFileSync(filename) {
    let data = JSON.stringify(obj);
    fs.writeFileSync(filename, data);
}

function changeTaskStatus() {
    obj.tasks.forEach(task => {
        if (task.status === TaskStatus.IN_PROGRESS)
            if (task.deadline < new Date(Date.now())) {
                task.status = TaskStatus.EXPIRED;
        }
    })
}

