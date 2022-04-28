function linechart(seqPC, noSeqPC) {
  var PCTrace = {
    x : DATA_POINTS,
    y : seqPC
  };

  var noPCTrace = {
    x : DATA_POINTS,
    y : noSeqPC
  };
  var layout = {
    xaxis: {
      type: 'log',
      autorange: true
    }
  };
  var data = [PCTrace, noPCTrace];
  var layout = {
  title:'Execution time in parameter of line number'
  };
  Plotly.newPlot('linechart', data);
}

function ratiochart(seqPC, noSeqPC) {
  ratio = []
  for (var i = 0; i < seqPC.length; i++){
    ratio.push(seqPC[i]/noSeqPC[i]);
  }
  var ratioTrace = {
    x : DATA_POINTS,
    y : ratio
  };
  var layout = {
    xaxis: {
      type: 'log',
      autorange: true
    }
  };

  var data = [ratioTrace];
  var layout = {
  title:'ratio in parameter of line number'
  };
  Plotly.newPlot('ratio', data);
}
