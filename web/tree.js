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

const decision_tree = new Tree("f64x2.sqrt__f64x2.add");

decision_tree.insert("f64x2.sqrt__f64x2.add", "f64.trunc__f64.copysign");
decision_tree.insert("f64x2.sqrt__f64x2.add", ["sandy bridge"]);

decision_tree.insert("f64.trunc__f64.copysign", "f64.floor__f64.max");
decision_tree.insert("f64.trunc__f64.copysign", "i64.clz__i64.div_u");

decision_tree.insert("f64.floor__f64.max", ["haswell"]);
decision_tree.insert("f64.floor__f64.max", "i64.popcnt__i64.div_u");

decision_tree.insert("i64.clz__i64.div_u", "i64.ctz__i64.rotr");
decision_tree.insert("i64.clz__i64.div_u", ["westmere"]);

decision_tree.insert("i64.popcnt__i64.div_u", "f64.min__f64.copysign");
decision_tree.insert("i64.popcnt__i64.div_u", ["zen"]);

decision_tree.insert("i64.ctz__i64.rotr", "f64x2.ceil__f64x2.min");
decision_tree.insert("i64.ctz__i64.rotr", ["ivy bridge"]);

decision_tree.insert("f64.min__f64.copysign", ["comet lake"]);
decision_tree.insert("f64.min__f64.copysign", "i64.ctz__i64.add");

decision_tree.insert("f64x2.ceil__f64x2.min", ["broadwell"]);
decision_tree.insert("f64x2.ceil__f64x2.min", "f64.abs__f64.min");

decision_tree.insert("i64.ctz__i64.add", ["coffee lake"]);
decision_tree.insert("i64.ctz__i64.add", ["Zen 3"]);

decision_tree.insert("f64.abs__f64.min", ["cascade lake sp"]);
decision_tree.insert("f64.abs__f64.min", ["skylake"]);



async function fitInTree(tree) {
  console.log(tree.root)
  var currentNode = tree.root;
  let clock = await initSAB(atomic = true);
  console.log("Warming up");
  await warmUp();
  results = {}
  results["ratio"] = {}
  while (!currentNode.isLeaf) {
    instructions = currentNode.key.split("__");
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
  console.log(currentNode.key)
  results["generation"] = currentNode.key;
  return results
}
