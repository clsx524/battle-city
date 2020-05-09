const path = require('path'),
   express = require('express'),
   http = require('http'),
   webpack = require('webpack'),
   initWebpack = require('./webpack.config.js'),
   WebSocket = require('ws'),
   app = express();

let webpackConfig = initWebpack({}, process.argv);
let port = process.env.PORT || 8382;

let compiler = webpack(webpackConfig);

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true, 
    publicPath: webpackConfig.output.publicPath, 
    stats: { 
       colors: true 
    }
}));
app.use(require('webpack-hot-middleware')(compiler));
app.use(express.static(path.resolve(__dirname, 'dist')));

var server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
      });

    let counter = 0;

    setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const value = Math.sin(counter++ * 0.1);
            const data = {
                timestamp: Date.now(),
                value
            };
            ws.send(JSON.stringify(data))
        }
    }, 5000);

});
   
server.listen(port, () => { console.log(`App is listening on port ${port}`) });
// app.get('/', (req, res) => {
//    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
// });

