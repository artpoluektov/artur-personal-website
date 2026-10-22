import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.webp':'image/webp','.png':'image/png','.ttf':'font/ttf','.pdf':'application/pdf','.xml':'application/xml','.txt':'text/plain'};
http.createServer(async(req,res)=>{let path;try{path=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return}const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+'/')){res.writeHead(403);res.end();return}try{const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','X-Robots-Tag':'noindex, nofollow'});res.end(data)}catch{res.writeHead(404,{'Content-Type':'text/html'});res.end(await readFile(root+'/404.html'))}}).listen(4173,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:4173'));
