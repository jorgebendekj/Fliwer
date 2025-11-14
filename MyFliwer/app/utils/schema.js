import { schema } from 'normalizr';

const plant = new schema.Entity('plants',{},{ idAttribute: 'idPlant' });

const plantCategory = new schema.Entity('plantCategory', {
  plant: [plant]
}, { idAttribute: 'idPlantCategory' });

const plantList = new schema.Entity('plantList',{
  category: [plantCategory]
});

const zone = new schema.Entity('zones', {
  plants: [{idPlant:plant}]
}, {
  idAttribute: 'idZone',
  processStrategy: (entity) => {
    if(entity.plants){
      for(var i=0;i<entity.plants.length;i++){
        entity.plants[i]={idPlant:entity.plants[i],plant_phase:entity.plants[i].plant_phase}
      }
    }
    return entity;
} });

const garden = new schema.Entity('gardens', {
  zones: [zone]
});

const home = new schema.Entity('homes', {
  gardens: [garden]/*,
  meteo: [meteo]*/
});

const country = new schema.Entity('country',{},{ idAttribute: 'Code' });

const countryList =  new schema.Entity('countries', {
  countries: [country]
});

const device = new schema.Entity('device',{},{ idAttribute: 'DeviceSerialNumber' });

const deviceList =  new schema.Entity('devices', {
  devices: [device]
});

const taskManagerHistory = new schema.Entity('taskManagerHistory',{},{ idAttribute: 'id' });

const taskManagerHistoryList =  new schema.Entity('taskManagerHistories', {
  taskManagerHistories: [taskManagerHistory]
});

const irrigationHistory = new schema.Entity('irrigationHistory',{},{ idAttribute: 'id' });

const irrigationHistoryList =  new schema.Entity('irrigationHistories', {
  irrigationHistories: [irrigationHistory]
});

const irrigationProgram = new schema.Entity('irrigationProgram',{},{ idAttribute: 'id' });

const irrigationProgramList =  new schema.Entity('irrigationPrograms', {
  irrigationPrograms: [irrigationProgram]
});

const gardener = new schema.Entity('gardener',{},{ idAttribute: 'id' });

const gardenerList =  new schema.Entity('gardeners', {
  gardeners: [gardener]
});

const visitor = new schema.Entity('visitor',{},{ idAttribute: 'id' });

const visitorList =  new schema.Entity('visitors', {
  visitors: [visitor]
});


export default {
  plantList:plantList,
  countryList:countryList,
  deviceList:deviceList,
  plantCategory:plantCategory,
  plant:plant,
  zone:zone,
  garden:garden,
  home:home,
  country:country,
  device:device,
  taskManagerHistory:taskManagerHistory,
  taskManagerHistoryList:taskManagerHistoryList,
  irrigationHistory:irrigationHistory,
  irrigationHistoryList:irrigationHistoryList,
  irrigationProgram:irrigationProgram,
  irrigationProgramList:irrigationProgramList,
  gardener:gardener,
  gardenerList:gardenerList,
  visitor:visitor,
  visitorList:visitorList,
};
