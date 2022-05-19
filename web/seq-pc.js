const RATIO_THRESHOLD = 1.07


async function warmUp() {
  let {seqPC, seqNoPC} = await initWasm("i64.ctz","i64.clz");
  for (var i = 0; i < 100;i++) {
  seqPC(BigInt(1256456456));
  seqNoPC(BigInt(23415646514));}
}

async function initWasm(instruction_1, instruction_2) {
  const wasm = fetch(`./build/${instruction_1}_${instruction_2}.wasm`);
  const {instance} = await WebAssembly.instantiateStreaming(wasm);
  let seqPC = await instance.exports.seq_pc;
  let seqNoPC = await instance.exports.seq_nopc;
  return {seqPC, seqNoPC}
}

function getParam(instruction_1) {
  if (VOP.includes(instruction_1)) {
    var param = []
    var {numType, paramCount} = parseVShape(instruction_1);
    switch (numType) {
      case 'i16':
        for (var i = 0; i < Number(paramCount); i++) {
          param.push(getRandomInt(Math.pow(2,15)))
        }
        break;
      case 'f64':
        for (var i = 0; i < Number(paramCount); i++) {
          param.push(getRandomFloat(Math.pow(2,63)));
        }
        break;
      default:
        console.log("Invalid type");
    }
  }
  else{
    if (typeof(instruction_1) == "string") {
      var type = instruction_1.substring(0,3)
    }
    else {
      var type = instruction_1[1].substring(0,3)
    }
    var param
    switch (type) { // As we have different types, we instantiate the proper parameter
      case 'i32':
        param = getRandomInt(Math.pow(2,31));
        break;
      case 'i64':
        param = BigInt(getRandomInt(Math.pow(2,63)));
        break;

      case 'f32':
        param = getRandomFloat(Math.pow(2,30));
        break;

      case 'f64':
        param = getRandomFloat(Math.pow(2,30));
        break;
      default:
        console.log("Invalid type");
    }
  }
  return param
}



async function testSeqPCWithClock(clock, instruction_1, instruction_2) {
  console.log(`Testing ${instruction_1}_${instruction_2}.wasm`)
  let {seqPC, seqNoPC} = await initWasm(instruction_1, instruction_2);
  var param = getParam(instruction_1);
  let begin,end;
  PCTime = []
  noPCTime = []
  var pcm = []
  var npcm = []
  for (var j = 0; j< 10; j++) {
    for (var i = 0; i <100; i++) {
      begin = Atomics.load(clock.array,0);
      seqNoPC(param)
      end = Atomics.load(clock.array,0);
      noPCTime.push(end-begin);

      begin = Atomics.load(clock.array,0);
      seqPC(param)
      end = Atomics.load(clock.array,0);
      PCTime.push(end-begin);
    }
    pcm.push(math.median(PCTime))
    npcm.push(math.median(noPCTime))
  }

  // console.log("PC: ", pcm)
  // console.log("No PC: ", npcm)
  // console.log("Ratio: ", pcm / npcm);
  return {pcm, npcm}
}


async function testAll() {
  let clock = await initSAB(atomic = true);
  seqPC = []
  noSeqPC = []
  console.log("Warming up");
  await warmUp();
  results = {}
  type = ["i64"]
  instruction_list = cross_product(type, IUNOP).concat(cross_product(type,IBINOP))
  for (instruction_1 of instruction_list){
      for (instruction_2 of instruction_list){
        if (!((`${instruction_1}_${instruction_2}` in results) || (`${instruction_2}_${instruction_1}` in results))) {
          var {pcm, npcm} = await testSeqPCWithClock(clock,instruction_1,instruction_2)
          results[`${instruction_1}_${instruction_2}`] = {"pcm": pcm, "npcm": npcm}
        }
      }
  }
  type = ["f64"]

  instruction_list = cross_product(type, FUNOP).concat(cross_product(type,FBINOP))
  for (instruction_1 of instruction_list)
      for (instruction_2 of instruction_list)
          if (!((`${instruction_1}_${instruction_2}` in results) || (`${instruction_2}_${instruction_1}` in results))) {
            var {pcm, npcm} = await testSeqPCWithClock(clock,instruction_1,instruction_2)
            results[`${instruction_1}_${instruction_2}`] = {"pcm": pcm, "npcm": npcm}
          }
  type = ["i16x8"]
  instruction_list = cross_product(type, VIUNOP).concat(cross_product(type,VIBINOP),cross_product(type,VIMINMAXOP),cross_product(type,VISATBINOP),cross_product(type,["mul"]),cross_product(type,["avgr_u"]), ["i16x8.q15mulr_sat_s"])
  for (instruction_1 of instruction_list) {
      for (instruction_2 of instruction_list) {
          if (!((`${instruction_1}_${instruction_2}` in results) || (`${instruction_2}_${instruction_1}` in results))) {
            var {pcm, npcm} = await testSeqPCWithClock(clock,instruction_1,instruction_2)
            results[`${instruction_1}_${instruction_2}`] = {"pcm": pcm, "npcm": npcm}
        }
      }
  }
  type = ["f64x2"]
  instruction_list = cross_product(type, VFUNOP).concat(cross_product(type,VFBINOP))
  for (instruction_1 of instruction_list) {
      for (instruction_2 of instruction_list) {
        if (!((`${instruction_1}_${instruction_2}` in results) || (`${instruction_2}_${instruction_1}` in results))) {

          var {pcm, npcm} = await testSeqPCWithClock(clock,instruction_1,instruction_2)
          results[`${instruction_1}_${instruction_2}`] = {"pcm": pcm, "npcm": npcm}
        }
      }
  }
  console.log("done")
  console.log(results)
  return results
}




async function testFit(instructions){
  let clock = await initSAB(atomic = true);
  seqPC = []
  noSeqPC = []
  console.log("Warming up");
  await warmUp();
  results = {}
  for (instruction_pair of instructions) {

    var instruction_1 = instruction_pair.split(/\_(?=[if])/g)[0];
    var instruction_2 = instruction_pair.split(/\_(?=[if])/g)[1];
    var {pcm, npcm} = await testSeqPCWithClock(clock,instruction_1,instruction_2);
    results[`${instruction_1}_${instruction_2}`] = {"pcm": pcm, "npcm": npcm};
  }
  clock.worker.terminate()
  return results;
}

function write_results(results) {
  var textArea = document.getElementById("results_text");
  textArea.innerHTML = JSON.stringify(results);
  document.getElementById("results_div").style.visibility = 'visible';

}



async function initWasm_tor(path) {
  const wasm = fetch(path);
  const {instance} = await WebAssembly.instantiateStreaming(wasm);
  let seqPC = await instance.exports.seq_pc;
  let seqNoPC = await instance.exports.seq_nopc;
  return {seqPC, seqNoPC}
}


async function testSeqPC_tor(path) {
  console.log(`Testing with ${path} ...`)
  let {seqPC, seqNoPC} = await initWasm_tor(path);
  let begin,end;
  PCTime = []
  noPCTime = []

  for (var i = 0; i <100; i++) {
    begin = performance.now()
    seqNoPC(BigInt(101245645646))
    end = performance.now()
    noPCTime.push(end-begin);

    begin = performance.now()
    seqPC(BigInt(101245645646))
    end = performance.now()
    PCTime.push(end-begin);
  }
  var pcm = math.median(PCTime)
  var npcm = math.median(noPCTime)
  console.log("PC: ", pcm)
  console.log("No PC: ", npcm)
  console.log("Ratio: ", pcm / npcm);
  return {pcm, npcm}
}

async function testTor() {
  await testSeqPC_tor('./build/seq-pc_popcnt-or.wasm')
  await testSeqPC_tor('./build/seq-pc_popcnt-ctz.wasm')

}



async function main(){
  // var ratios = await testFit(INSTRUCTIONS);
  // results = {
  //   cpu: document.getElementById("cpu").value,
  //   user_agent: window.navigator.userAgent,
  //   ratios: ratios,
  // }
  document.getElementById("computing").style.visibility = 'visible';

  var start = performance.now()
  var results_t = await testFit(TESTED_INSTRUCTIONS)
  var end = performance.now()
  results = {}
  results['timings'] = results_t
  results["cpu"] = document.getElementById("cpu").value;
  results["user_agent"] = window.navigator.userAgent;
  results["time"] = end - start
  results["ground_truth"] = ""
  results["classifier"] = 'KNN v1'
  document.getElementById("computing").style.visibility = 'hidden';

  write_results(results)


  // console.log(results)
}
