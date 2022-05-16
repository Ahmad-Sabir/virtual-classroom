const path = require('path');
const express = require('express');
const socket = require('socket.io');
const cookieParser = require('cookie-parser');
const dataSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const dbConnect = require('./config/db');
const viewRouter = require('./routes/viewRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const Traffic = require('./models/trafic');
const courseRouter = require('./routes/courseRoutes');
const assignmentRouter = require('./routes/assignmentRoutes');
const submittionRoute = require('./routes/submissionRoutes');
const meetingRoute = require('./routes/meetingRoutes');
const courseMaterialRoute = require('./routes/courseMaterialRoutes');
const chat = require('./controllers/chatController');
const meeting = require('./controllers/liveMeetingController');
const globalErrorHandler = require('./controllers/errorHandler');
var counter = 0;
const PORT = process.env.PORT || 8000;
const app = express();
dbConnect();
app.set('view engine', 'ejs');
app.locals.moment = require('moment');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/admin/')]);
//Global middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(dataSanitize());

app.use((req, res, next) => {
	counter = counter + 1;
	setTimeout(async () => {
		await Traffic.create({ count: counter, date: Date.now() });
		counter = 0;
	}, 432);
	next();
});
app.use(compression());
//Routes
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/assignments', assignmentRouter);
app.use('/api/v1/assignmentSub', submittionRoute);
app.use('/api/v1/meetings', meetingRoute);
app.use('/api/v1/courseFiles', courseMaterialRoute);
// app.use('/api/v1/meetings', meetingRoute);
app.all('*', (req, res, next) => {
	res.redirect('/');
	//next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
//Global Error Handler
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
const io = socket(server, { serveClient: true });

io.on('connection', chat.onConnection);
io.on('connection', meeting.onconnection);
