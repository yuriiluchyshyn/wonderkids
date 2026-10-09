import TEXTS from '@/locales/app/uk/games/history.json';

const J = TEXTS.content.dinosaurs;

/**
 * Fifty dinosaurs for «Динозаври». `feature` is the one thing that tells this
 * dinosaur apart (used both as the story after feeding it and as the clue in
 * the "who is it?" quiz), so it must never contain the dinosaur's own name.
 */
export interface Dino {
  id: string;
  name: string;
  eats: 'meat' | 'plants';
  feature: string;
}

const m = (id: string, name: string, feature: string): Dino => ({ id, name, eats: 'meat', feature });
const p = (id: string, name: string, feature: string): Dino => ({ id, name, eats: 'plants', feature });

// Best-known first: the first ones are what a child meets on day one.
export const DINOSAURS: Dino[] = [
  m('trex', J.DINOSAURS[0][1], J.DINOSAURS[0][2]),
  p('triceratops', J.DINOSAURS[1][1], J.DINOSAURS[1][2]),
  p('diplodocus', J.DINOSAURS[2][1], J.DINOSAURS[2][2]),
  m('velociraptor', J.DINOSAURS[3][1], J.DINOSAURS[3][2]),
  p('stegosaurus', J.DINOSAURS[4][1], J.DINOSAURS[4][2]),
  m('spinosaurus', J.DINOSAURS[5][1], J.DINOSAURS[5][2]),
  p('brachiosaurus', J.DINOSAURS[6][1], J.DINOSAURS[6][2]),
  p('ankylosaurus', J.DINOSAURS[7][1], J.DINOSAURS[7][2]),
  m('allosaurus', J.DINOSAURS[8][1], J.DINOSAURS[8][2]),
  p('iguanodon', J.DINOSAURS[9][1], J.DINOSAURS[9][2]),
  p('parasaurolophus', J.DINOSAURS[10][1], J.DINOSAURS[10][2]),
  p('pachycephalosaurus', J.DINOSAURS[11][1], J.DINOSAURS[11][2]),
  m('giganotosaurus', J.DINOSAURS[12][1], J.DINOSAURS[12][2]),
  p('brontosaurus', J.DINOSAURS[13][1], J.DINOSAURS[13][2]),
  m('dilophosaurus', J.DINOSAURS[14][1], J.DINOSAURS[14][2]),
  m('carnotaurus', J.DINOSAURS[15][1], J.DINOSAURS[15][2]),
  p('styracosaurus', J.DINOSAURS[16][1], J.DINOSAURS[16][2]),
  m('compsognathus', J.DINOSAURS[17][1], J.DINOSAURS[17][2]),
  p('argentinosaurus', J.DINOSAURS[18][1], J.DINOSAURS[18][2]),
  m('baryonyx', J.DINOSAURS[19][1], J.DINOSAURS[19][2]),
  p('maiasaura', J.DINOSAURS[20][1], J.DINOSAURS[20][2]),
  m('deinonychus', J.DINOSAURS[21][1], J.DINOSAURS[21][2]),
  p('apatosaurus', J.DINOSAURS[22][1], J.DINOSAURS[22][2]),
  m('ceratosaurus', J.DINOSAURS[23][1], J.DINOSAURS[23][2]),
  p('protoceratops', J.DINOSAURS[24][1], J.DINOSAURS[24][2]),
  m('utahraptor', J.DINOSAURS[25][1], J.DINOSAURS[25][2]),
  p('therizinosaurus', J.DINOSAURS[26][1], J.DINOSAURS[26][2]),
  m('microraptor', J.DINOSAURS[27][1], J.DINOSAURS[27][2]),
  p('edmontosaurus', J.DINOSAURS[28][1], J.DINOSAURS[28][2]),
  m('carcharodontosaurus', J.DINOSAURS[29][1], J.DINOSAURS[29][2]),
  p('corythosaurus', J.DINOSAURS[30][1], J.DINOSAURS[30][2]),
  m('albertosaurus', J.DINOSAURS[31][1], J.DINOSAURS[31][2]),
  p('kentrosaurus', J.DINOSAURS[32][1], J.DINOSAURS[32][2]),
  m('megalosaurus', J.DINOSAURS[33][1], J.DINOSAURS[33][2]),
  p('mamenchisaurus', J.DINOSAURS[34][1], J.DINOSAURS[34][2]),
  m('coelophysis', J.DINOSAURS[35][1], J.DINOSAURS[35][2]),
  p('psittacosaurus', J.DINOSAURS[36][1], J.DINOSAURS[36][2]),
  m('tarbosaurus', J.DINOSAURS[37][1], J.DINOSAURS[37][2]),
  p('pentaceratops', J.DINOSAURS[38][1], J.DINOSAURS[38][2]),
  m('herrerasaurus', J.DINOSAURS[39][1], J.DINOSAURS[39][2]),
  p('amargasaurus', J.DINOSAURS[40][1], J.DINOSAURS[40][2]),
  m('cryolophosaurus', J.DINOSAURS[41][1], J.DINOSAURS[41][2]),
  p('euoplocephalus', J.DINOSAURS[42][1], J.DINOSAURS[42][2]),
  m('mapusaurus', J.DINOSAURS[43][1], J.DINOSAURS[43][2]),
  p('plateosaurus', J.DINOSAURS[44][1], J.DINOSAURS[44][2]),
  p('camarasaurus', J.DINOSAURS[45][1], J.DINOSAURS[45][2]),
  p('lambeosaurus', J.DINOSAURS[46][1], J.DINOSAURS[46][2]),
  p('hypsilophodon', J.DINOSAURS[47][1], J.DINOSAURS[47][2]),
  p('titanosaurus', J.DINOSAURS[48][1], J.DINOSAURS[48][2]),
  p('dreadnoughtus', J.DINOSAURS[49][1], J.DINOSAURS[49][2]),
];
