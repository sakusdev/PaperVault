export type CompressionMethod=0|1|2|3|4;
export type CompressionStrength=0|1|2|3;

function ownedArrayBuffer(data:Uint8Array):ArrayBuffer{const copy=new Uint8Array(data.byteLength);copy.set(data);return copy.buffer}
async function streamCompress(data:Uint8Array,format:"gzip"|"deflate"){const stream=new Blob([ownedArrayBuffer(data)]).stream().pipeThrough(new CompressionStream(format));return new Uint8Array(await new Response(stream).arrayBuffer())}
async function streamDecompress(data:Uint8Array,format:"gzip"|"deflate"){const stream=new Blob([ownedArrayBuffer(data)]).stream().pipeThrough(new DecompressionStream(format));return new Uint8Array(await new Response(stream).arrayBuffer())}

function rleEncode(data:Uint8Array){const out:number[]=[];let i=0;while(i<data.length){let run=1;while(i+run<data.length&&data[i+run]===data[i]&&run<128)run++;if(run>=4){out.push(0x80|(run-1),data[i]);i+=run;continue}const start=i;i+=run;while(i<data.length){let nextRun=1;while(i+nextRun<data.length&&data[i+nextRun]===data[i]&&nextRun<128)nextRun++;if(nextRun>=4||i-start>=128)break;i+=nextRun}const len=i-start;out.push(len-1);for(let j=start;j<i;j++)out.push(data[j])}return new Uint8Array(out)}
function rleDecode(data:Uint8Array){const out:number[]=[];let i=0;while(i<data.length){const control=data[i++];const len=(control&0x7f)+1;if(control&0x80){if(i>=data.length)throw new Error("RLEデータが壊れています");const value=data[i++];for(let n=0;n<len;n++)out.push(value)}else{if(i+len>data.length)throw new Error("RLEデータが壊れています");for(let n=0;n<len;n++)out.push(data[i++])}}return new Uint8Array(out)}

export function compressionLabel(method:CompressionMethod){return method===0?"none":method===1?"gzip":method===2?"deflate":method===3?"RLE + gzip":"RLE + deflate"}

export async function compressBest(data:Uint8Array,strength:CompressionStrength){if(strength===0||typeof CompressionStream==="undefined")return{data,method:0 as CompressionMethod};const candidates:{data:Uint8Array;method:CompressionMethod}[]=[{data,method:0}];try{candidates.push({data:await streamCompress(data,"gzip"),method:1})}catch{}
if(strength>=2){try{candidates.push({data:await streamCompress(data,"deflate"),method:2})}catch{}}
if(strength>=3){const rle=rleEncode(data);try{candidates.push({data:await streamCompress(rle,"gzip"),method:3})}catch{}try{candidates.push({data:await streamCompress(rle,"deflate"),method:4})}catch{}}
return candidates.reduce((best,current)=>current.data.length<best.data.length?current:best)}

export async function decompressByMethod(data:Uint8Array,method:CompressionMethod){if(method===0)return data;if(typeof DecompressionStream==="undefined")throw new Error("このブラウザは圧縮データの復元に対応していません");if(method===1)return streamDecompress(data,"gzip");if(method===2)return streamDecompress(data,"deflate");if(method===3)return rleDecode(await streamDecompress(data,"gzip"));if(method===4)return rleDecode(await streamDecompress(data,"deflate"));throw new Error("未知の圧縮方式です")}
