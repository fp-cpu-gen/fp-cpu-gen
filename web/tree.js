class TreeNode {
  constructor(key, value = key, parent = null) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.children = [];
  }

  get isLeaf() {
    return this.children.length === 0;
  }

  get hasChildren() {
    return !this.isLeaf;
  }
}

class Tree {
  constructor(key, value = key) {
    this.root = new TreeNode(key, value);
  }

  *preOrderTraversal(node = this.root) {
    yield node;
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.preOrderTraversal(child);
      }
    }
  }

  *postOrderTraversal(node = this.root) {
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.postOrderTraversal(child);
      }
    }
    yield node;
  }

  insert(parentNodeKey, key, value = key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === parentNodeKey) {
        node.children.push(new TreeNode(key, value, node));
        return true;
      }
    }
    return false;
  }

  remove(key) {
    for (let node of this.preOrderTraversal()) {
      const filtered = node.children.filter(c => c.key !== key);
      if (filtered.length !== node.children.length) {
        node.children = filtered;
        return true;
      }
    }
    return false;
  }

  find(key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === key) return node;
    }
    return undefined;
  }
}

// const decision_tree = new Tree("f64x2.sqrt__f64x2.add");
//
// decision_tree.insert("f64x2.sqrt__f64x2.add", "f64.trunc__f64.copysign");
// decision_tree.insert("f64x2.sqrt__f64x2.add", ["sandy bridge"]);
//

function createTree(treeData) {
  var decisionTree = new Tree(0, value = treeData.feature_names[treeData.features[0]]);

  for (var i = 0; i < treeData.children_left.length; i++) {
    if (treeData.children_left[i] != -1) {
      let children_id = treeData.children_left[i];
      let children_instructions;
      if (treeData.features[children_id] == -2) {
        let generations = [];
        for (var j = 0; j < treeData.classes[children_id].length; j++) {
          if (treeData.classes[children_id][j] == 1) {
            generations.push(treeData.class_names[j]);
          }
        }
        children_instructions=generations
      }
      else {
        children_instructions = treeData.feature_names[treeData.features[children_id]]
      }
      decisionTree.insert(i, children_id, children_instructions)
    }
    if (treeData.children_right[i] != -1) {
      let children_id = treeData.children_right[i];
      let children_instructions;
      if (treeData.features[children_id] == -2) {
        let generations = [];
        for (var j = 0; j < treeData.classes[children_id].length; j++) {
          if (treeData.classes[children_id][j] == 1) {
            generations.push(treeData.class_names[j]);
          }
        }
        children_instructions=generations
      }
      else {
        children_instructions = treeData.feature_names[treeData.features[children_id]]
      }
      decisionTree.insert(i, children_id, children_instructions)
    }
  }
  console.log(decisionTree);
  return decisionTree
}

const decisionTree = createTree(tree_data)
async function fitInTree(tree) {
  console.log(tree.root)
  var currentNode = tree.root;
  let clock = await initSAB(atomic = true);
  console.log("Warming up");
  await warmUp();
  results = {}
  results["ratio"] = {}
  while (!currentNode.isLeaf) {
    instructions = currentNode.value.split(/\_(?=[if])/g);
    var pcm_sum = 0;
    var npcm_sum = 0;
    var rep = 5
    for (var i = 0; i < rep; i++) {
      var {pcm, npcm} = await testSeqPCWithClock(clock, instructions[0], instructions[1]);
      pcm_sum+=pcm;
      npcm_sum += npcm
    }
    results["ratio"][currentNode.key] = pcm_sum/npcm_sum
    console.log(pcm_sum/npcm_sum);
    if ((pcm_sum / npcm_sum) < RATIO_THRESHOLD) {
      currentNode = currentNode.children[0];
    }
    else {
      currentNode = currentNode.children[1];
    }
  }
  clock.worker.terminate()
  console.log(currentNode.value)
  results["generation"] = currentNode.key;
  return results
}
