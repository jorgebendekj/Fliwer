//Class SendModule
import structuredClone from "@ungap/structured-clone";

class SocketSendModule {

    constructor(socket,options){
        /*
            options:{
                maxRetries: 10,
                retryTimeout: 3000,
                delayBetweenMessages: 200           
            }
        */
       if(!options)options={};
       this.socket=socket;
       
       this.lastSend=0;
        /*
            cnnectionQueue:[
                {
                    destination: "0000000000000000",
                    command: "0x00",
                    data,
                    retries: 10
                }
            ]
        */
        this.connectionQueue=[];
        /*
            deviceMessageQueue:[
                {
                    destination: "0000000000000000",
                    command: "0x00",
                    data,
                    retries: 10,
                    timeOut: setTimeout
                }
            ]
        */
        this.deviceMessageQueue={};

        this.maxRetries=options.maxRetries || 5;
        this.retryTimeout=options.retryTimeout || 10000;
        this.delayBetweenMessages=options.delayBetweenMessages || 0;

        /*
        setInterval(()=>{
            this.printModuleStatus();
        },2000);
        */

    }

    //private

    _connectionSend(){
        /*
        console.log("[SendModule][ConnectionSend]");
        this.printModuleStatus();
        */
        if(this.connectionQueue.length>0){
            //Send the first message in the queue
            //this.printModuleStatus();
            console.log("[SendModule] Sending message from connection queue",JSON.stringify(this.connectionQueue[0]))
            if(this.socket){
                var data=structuredClone(this.connectionQueue[0].data);
                data.idDevice=this.connectionQueue[0].destination;
                this.socket.sendJSON({command:this.connectionQueue[0].command,data:data}); 
            }

            //If the message have retries, set a timeout to send it again in case of no response
            if(this.connectionQueue[0].retries!=-1){
                console.log("[SendModule] Setting timeout for message",JSON.stringify(this.connectionQueue[0]));
                if(this.deviceMessageQueue[this.connectionQueue[0].destination][0] && this.deviceMessageQueue[this.connectionQueue[0].destination][0].retries){
                    this.deviceMessageQueue[this.connectionQueue[0].destination][0].retries--;
                    ((destination)=>{
                        console.log("[testWebSocket] Set timeout for message: %s",this.connectionQueue[0]);
                        this.deviceMessageQueue[this.connectionQueue[0].destination][0].timeOut=setTimeout(()=>{
                            console.log("[testWebSocket] Timeout for message",this.connectionQueue[0],". Retrying message");
                            console.log("[SendModule] Timeout for message",this.connectionQueue[0],". Retrying message")
                            this._sendNextMessage(destination);
                        },this.deviceMessageQueue[this.connectionQueue[0].destination][0].retryTimeout?this.deviceMessageQueue[this.connectionQueue[0].destination][0].retryTimeout:this.retryTimeout);
                    })(this.connectionQueue[0].destination)
                }else{
                    console.log("[SendModule] Something went wrong. Message",JSON.stringify(this.connectionQueue[0]),"doesn't exist in deviceMessageQueue");
                    console.log("[SendModule] Message queue:",JSON.stringify(this.deviceMessageQueue));
                }
            }
            //Unshift the message from the connection queue
            this.connectionQueue.shift();
            this.lastSend=Date.now();
        }
        if(this.connectionQueue.length>0)setTimeout(()=>{this._connectionSend()},this.delayBetweenMessages);
    }

    _pushMessageToConnectionQueue(message){
        console.log("[SendModule] Pushing message to connection queue",JSON.stringify(message))
        //Queue message to connection queue
        this.connectionQueue.push(message);

        //If it's the first message
        if (this.connectionQueue.length == 1) {
            var now = Date.now();
            //Send it when the last message was sent more than this.delayBetweenMessages(ms) ago
            if (now - this.lastSend < this.delayBetweenMessages) setTimeout(()=>{this._connectionSend()}, this.delayBetweenMessages - (now - this.lastSend));
            else this._connectionSend();
        }

        //If the message doesn't have retries, unsfhit it from the device queue and push the next message to the connection queue
        if(message.retries==-1){
            this.deviceMessageQueue[message.destination].shift();
            this._sendNextMessage(message.destination);
        }
    }

    _sendNextMessage(destination){
        console.log("[testWebSocket] Sending next message for device",destination)
        console.log("[SendModule] Sending next message for device",destination)
        if(this.deviceMessageQueue[destination] && this.deviceMessageQueue[destination].length>0){
            if(this.deviceMessageQueue[destination][0].retries==0){
                console.log("[SendModule] Failed to send message",JSON.stringify(this.deviceMessageQueue[destination][0]),". Sending next message");
                if(this.deviceMessageQueue[destination][0].onFailedToSend)this.deviceMessageQueue[destination][0].onFailedToSend();
                this.deviceMessageQueue[destination].shift();
            }
            let message=this.deviceMessageQueue[destination][0];
            if(message)this._pushMessageToConnectionQueue(message);
        }else console.log("[SendModule] No more messages for device",destination);
    }

    //public

    sendData(command, destination, data, retry, onFailedToSend, onSuccessToSend, retryTimeout){
        console.log("[testWebSocket] "+Date.now()+" | sendData",command,destination,data,retry,retryTimeout)
        console.log(Date.now()+" | sendData",command,destination,data,retry);
        
        if (!this.socket) console.log(data);
        else{
            //Check if the device has a queue
            if(!this.deviceMessageQueue[destination]) this.deviceMessageQueue[destination]=[];
    
            //Check if the message has retries
            if(retry)retry=this.maxRetries;
            else if(onSuccessToSend)retry=1;
            else retry=-1;
    
            //Add the message to the device queue
            this.deviceMessageQueue[destination].push({destination:destination,command:command,data:data,retries:retry, onFailedToSend: retry>0 && onFailedToSend?onFailedToSend:null, onSuccessToSend: onSuccessToSend?onSuccessToSend:null,retryTimeout:retryTimeout});
            
            console.log("[SendModule] Message queued for device",destination,". Message:",JSON.stringify(this.deviceMessageQueue[destination][this.deviceMessageQueue[destination].length-1]));
    
            /*
            console.log("[SendModule][sendBinaryData]");
            this.printModuleStatus();
            */
    
            //if this is the first message in the queue, send it
            if(this.deviceMessageQueue[destination].length==1)this._sendNextMessage(destination);
            else console.log("[testWebSocket] sendData Not starting Next message:",this.deviceMessageQueue[destination])
        }

    }

    messageReceived(idDevice,command,packageCommand,data){
        console.log("[testWebSocket] messageReceived",idDevice,command,packageCommand,data)
        if(this.deviceMessageQueue[idDevice] && this.deviceMessageQueue[idDevice].length>0){
            //console.log("[testWebSocket] messageReceived 2",idDevice,command+" vs "+this.deviceMessageQueue[idDevice][0].command,packageCommand,data)
            if(this.deviceMessageQueue[idDevice][0].command==command){
                clearTimeout(this.deviceMessageQueue[idDevice][0].timeOut);
                //console.log("[testWebSocket] Response received from ",JSON.stringify(this.deviceMessageQueue[idDevice][0]),". Sending next message")
                //console.log("[SendModule] Response received from ",JSON.stringify(this.deviceMessageQueue[idDevice][0]),". Sending next message")

                //console.log("[testWebSocket] onFailedToSend",this.deviceMessageQueue[idDevice][0].onFailedToSend)
                //console.log("[testWebSocket] onSuccessToSend",this.deviceMessageQueue[idDevice][0].onSuccessToSend)
                if(packageCommand=="Nack" && this.deviceMessageQueue[idDevice][0].onFailedToSend)this.deviceMessageQueue[idDevice][0].onFailedToSend(data);
                else if(this.deviceMessageQueue[idDevice][0].onSuccessToSend)this.deviceMessageQueue[idDevice][0].onSuccessToSend(data);

                //console.log("[testWebSocket] messageReceived 3",this.deviceMessageQueue[idDevice])
                this.deviceMessageQueue[idDevice].shift();
                //this.printModuleStatus();
                //console.log("[testWebSocket] messageReceived 4",this.deviceMessageQueue[idDevice])
                this._sendNextMessage(idDevice);
            }else{
                console.log("[SendModule] Response received for",idDevice,command,"but no message found");
            }
        }
    }

    deleteDeviceStateFromQueue(idDevice,state){
        //delete from deviceMessageQueue
        if(this.deviceMessageQueue[idDevice] && this.deviceMessageQueue[idDevice].length>0){
            for(var i=0;i<this.deviceMessageQueue[idDevice].length;i++){
                if(this.deviceMessageQueue[idDevice][i].state==state){
                    if(this.deviceMessageQueue[idDevice][i].timeOut)clearTimeout(this.deviceMessageQueue[idDevice][i].timeOut);
                    this.deviceMessageQueue[idDevice].splice(i,1);
                    i--;
                }
            }
        }

        //delete from connectionQueue
        if(this.connectionQueue.length>0){
            for(var i=0;i<this.connectionQueue.length;i++){
                if(this.connectionQueue[i].state==state){
                    this.connectionQueue.splice(i,1);
                    i--;
                }
            }
        }

    }

    printModuleStatus(){
        console.log("====================================");
        console.log("[SendModule] Module Status:");
        console.log("[SendModule] Last Send:",this.lastSend);
        console.log("[SendModule] Connection Queue:");
        for(var i=0;i<this.connectionQueue.length;i++)console.log("pos",i,"| ",this.connectionQueue[i].destination,"command",this.connectionQueue[i].command,"retries",this.connectionQueue[i].retries);
        console.log("[SendModule] Device Message Queue:");
        for(var i in this.deviceMessageQueue){
            console.log("Device:",i);
            for(var j=0;j<this.deviceMessageQueue[i].length;j++)console.log("pos",j,"| ",this.deviceMessageQueue[i][j].destination,"command",this.deviceMessageQueue[i][j].command,"retries",this.deviceMessageQueue[i][j].retries,"timeout",this.deviceMessageQueue[i][j].timeOut?true:false);
        }
    }

    changeDelayBetweenMessages(delay){
        this.delayBetweenMessages=delay;
        console.log("[SendModule] Changed delay between messages to",delay,"ms");
    }

}

export default SocketSendModule;
