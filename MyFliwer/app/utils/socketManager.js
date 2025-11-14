/**
 */
import WebSocket from './webSocket/webSocket';
import {store} from '../store'; //Import the store
import SocketSendModule from './socketSendModule';
import * as ActionsDevice from '../actions/fliwerDeviceActions.js'; //Import your actions
import { create } from 'react-test-renderer';

const MAX_INTENTS = 20;
var cookie;
var logingOut=false;
/**
 * Class representing ajax service's.
 */
class SocketManager {

    
    constructor(options){

        if(!options)options={};

        /*
            server example:

            "fliwer.com:7252":{
                socket: socket,
                connected: true,
                sendModule: sendModule,
                devices:{
                    "ABCDEF0123456789":{
                        status: 0 //0: linking, 1: disconnected, 2: connected
                    }
                }
            }
        */
        this.servers={};
        this.devices={};
        this.updateActive=false;//ms
        this.retryTimeout=null;
        this.retryTime=1000;//ms
    }

    async ensureServer(server,self,force/*server disconnected*/){
        if(!self)self=this; 
        if(!self.servers[server] || force){
            await self.createServer(server,self);
        }
    }

    createServer(server,self){
        return new Promise((resolve,reject)=>{

            if(!self)self = this;


            if(self.servers[server] && self.servers[server].socket){
                console.log("There is a socket trying to handle the connection")
            }else{

                self.servers[server] = { 
                    connected: false,
                    devices:{}
                }
    
                const socket = new WebSocket(server);
    
                socket.sendJSON=(data)=>{
                    var jsonData;
                    try{
                        jsonData=JSON.stringify(data);
                    }catch(e){
                        console.log("Error parsing JSON:",e);
                    }
                    if(jsonData){
                        socket.send(jsonData);
                    }
                }
    
                socket.addEventListener('open', async function(){
                    console.log("socket to server",server,"connected");
    
                    await self.ensureServer(server);
                    self.servers[server].sendModule= new SocketSendModule(socket);
                    self.servers[server].socket=socket;
                    self.servers[server].connected= true;
                    resolve();
                });
    
                socket.addEventListener('message', function message(message) {
                    console.log("[testWebSocket] received message: %s", message.data);
                    console.log('[webSocket] received message: %s', message.data);
                    self.manageWebSocketMessage(server,socket,message.data);    
                });
                
                socket.addEventListener('close',async function(){
                    console.log("socket to server",server,"disconnected");
                    delete self.servers[server].socket;
                    self.servers[server].connected=false;
                    await self.ensureServer(server,self,true);
                    //Find devices using this server and update its status
                    for(var i in self.devices){
                        if(self.devices[i]==server){
                            ActionsDevice.updateRealtimeConnectionStatus(i,{status:0/*disconnected*/})(store.dispatch,store.getState);
                        }
                    }
                    //Retry connection
                    if(!self.servers[server].connected){
                        setTimeout(()=>{
                            self.ensureServer(server,self,true).then(()=>{
                                self.updateDeviceSockets();
                            },()=>{});
                        },self.retryTime)
                    }
                });
                socket.addEventListener('error', async function(err){
                    console.log("socket to server",server,"error:",err);
                    delete self.servers[server].socket;
                    self.servers[server].connected=false;
                    await self.ensureServer(server,self,true);
                    //Find devices using this server and update its status
                    for(var i in self.devices){
                        if(self.devices[i]==server){
                            ActionsDevice.updateRealtimeConnectionStatus(i,{status:0/*disconnected*/})(store.dispatch,store.getState);
                        }
                    }
                    //Retry connection
                    if(!self.servers[server].connected){
                        setTimeout(()=>{
                            self.ensureServer(server,self,true).then(()=>{
                                self.updateDeviceSockets();
                            },()=>{});
                        },self.retryTime)
                    }
    
                    
                });
            }

    
        })
    }

    getConnectionStatus(idDevice,webSocketServer){
        return new Promise((resolve,reject)=>{
            this.servers[webSocketServer].sendModule.sendData("subscribeDevice", idDevice,{},true,(data)=>{
                //onFailedToSend
                ActionsDevice.updateRealtimeConnectionStatus(idDevice,{status:1/*connected*/})(store.dispatch,store.getState);
                console.log("Error subscribing device",idDevice,"to server",webSocketServer);
                reject();
            },(data)=>{
                //onSuccessToSend
                console.log("Device",data.idDevice,"subscribed to server",webSocketServer);
                ActionsDevice.updateRealtimeConnectionStatus(data.idDevice,{status:data.connected?2:1/*connected*/})(store.dispatch,store.getState);
                resolve();
            });
        });
    }


    async updateDeviceSockets(self){
        //Get all device info from store reducer
        if(!self)self=this; 
        clearTimeout(self.retryTimeout);
        self.retryTimeout=null;
        if(!self.updateActive){
            self.updateActive=true;

            var deviceRTWithoutSocket=false;

            var devices = store.getState().fliwerDeviceReducer.devices;
            var deviceRealTimeInfo=store.getState().fliwerDeviceReducer.deviceRealTimeInfo
            //self.devices={};

            for(var i in devices){
                var device = devices[i];
                if(device.realTimeConfig && device.realTimeConfig.connectionTime && device.realTimeConfig.programmedTime<=Date.now()/1000 && device.realTimeConfig.webSocketPort){
                    var webSocketServer="wss://fliwer.com:"+device.realTimeConfig.webSocketPort;
                    //Check if server not exists
                    await self.ensureServer(webSocketServer);

                    if(self.servers[webSocketServer].connected){

                        //Check if device is in another server and delete its not the same
                        var alreadyInServer=false;
                        
                        if(self.devices[device.DeviceSerialNumber] && self.devices[device.DeviceSerialNumber]==webSocketServer)alreadyInServer=true;

                        if(!alreadyInServer || !deviceRealTimeInfo[device.DeviceSerialNumber] || deviceRealTimeInfo[device.DeviceSerialNumber].status==0 || (devices[device.DeviceSerialNumber].realTimeConfig.connected && deviceRealTimeInfo[device.DeviceSerialNumber].status==1)){
                            //ActionsDevice.updateRealtimeConnectionStatus(device.DeviceSerialNumber,{status:0/*linking*/})(store.dispatch);
                            if(!self.servers[webSocketServer].sendModule){
                                deviceRTWithoutSocket=true;
                            }else{
                                try{
                                    await self.getConnectionStatus(device.DeviceSerialNumber,webSocketServer)
                                }catch(error){
                                    deviceRTWithoutSocket=true;
                                }
                            }
                        }
                        self.devices[device.DeviceSerialNumber]=webSocketServer;

                    }else{
                        deviceRTWithoutSocket=true;
                    }

                }
            }

            //Remove servers without devices
            for(var i in self.servers){
                //If server is not in any self.decvices:
                if(!Object.values(self.devices).find((e)=>{return e==i})){
                    //Disconnect socket
                    self.servers[i].socket.close();
                    delete self.servers[i];
                }
            }

            if(deviceRTWithoutSocket){
                self.retryTimeout=setTimeout(()=>{
                    ActionsDevice.getDeviceList()(store.dispatch,store.getState);
                    //self.updateDeviceSockets(self) No nedd, it will be called by getDeviceList
                },self.retryTime);
            }
            self.updateActive=false;

        }
    }

    sendData(idDevice,command,data,retry,retryTimeout){
        return new Promise((resolve,reject)=>{
            if(this.devices[idDevice]){
                this.servers[this.devices[idDevice]].sendModule.sendData(command,idDevice,data,retry,(data)=>{
                    reject(data);
                },(data)=>{
                    resolve(data);
                },retryTimeout);
            }else{
                console.log("Device",idDevice,"not found in any server")
                reject({id:0,error:"Device not found"});
            }
        })
    }

    manageWebSocketMessage(server,socket,packet){
        var packetObj;
        var error=false;
        console.log("[testWebSocket] manageWebSocketMessage 1",packet);
        try{
            packetObj=JSON.parse(packet);
            if(!packetObj.command)throw "command not found in packet";
            else if(!packetObj.data)throw "data not found in packet";
            else if(!packetObj.data.idDevice)throw "data.idDevice not found in packet";
        }catch(e){
          console.log("Error: ",e,".parsing packet:",packet);
          console.log("Error: ",e,".parsing packet:",packet);
          return;
        }
        if(packetObj && !error){
            console.log("[testWebSocket] manageWebSocketMessage 2",packet);
            this.parseWebSocketMessage(server,packetObj.data.idDevice,socket,packetObj).then(() => { }, () => { });
        }
      }

      
    parseWebSocketMessage(webSocketServer,idDevice,socket,packet){
        return new Promise((resolve, reject) => {

            console.log(Date.now()+" | parseWebSocketMessage",packet,idDevice);
            
            switch(packet.command){
                case "Ack":
                case "Nack":
        
                    switch (packet.data.command) {
                        default:
                            //if(!this.servers[webSocketServer].sendModule)debugger;
                            this.servers[webSocketServer].sendModule.messageReceived(idDevice,packet.data.command,packet.command,packet.data);
                        break;
                    }

                break;

                case "updateConnectionStatus":
                    console.log("updateConnectionStatus",packet.data.connected);
                    ActionsDevice.updateRealtimeConnectionStatus(idDevice,{status:packet.data.connected?2:1})(store.dispatch,store.getState);
                break;

                case "irrigationStatusResponse":
                    ActionsDevice.updateRealTimeIrrigationStatus(idDevice,packet.data.status)(store.dispatch,store.getState);
                break;

                case "flowDataStatus":
                    ActionsDevice.updateRealTimeFlow(idDevice,packet.data.flow)(store.dispatch,store.getState);
                break;

                case "pingTestUpdate":
                    ActionsDevice.updateDevicePingTest(idDevice,packet.data.testData)(store.dispatch,store.getState);
                break;
            }
        });
    }

}

export var socketManager = new SocketManager()
