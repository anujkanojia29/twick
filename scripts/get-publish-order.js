const fs = require('fs');
const path = require('path');

// Packages that should be published (exclude examples and documentation)
const PUBLISHABLE_PACKAGES = [
  'media-utils',
  'canvas', 
  'timeline',
  'live-player',
  'visualizer',
  'video-editor',
  'render-server',
  'studio'
];

function getPackageDependencies(packagePath) {
  const pkgJsonPath = path.join(packagePath, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    return { dependencies: {}, devDependencies: {}, peerDependencies: {} };
  }
  
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  return {
    name: pkgJson.name,
    dependencies: pkgJson.dependencies || {},
    devDependencies: pkgJson.devDependencies || {},
    peerDependencies: pkgJson.peerDependencies || {}
  };
}

function getAllInternalDependencies(deps) {
  const internal = [];
  for (const [dep, version] of Object.entries(deps)) {
    if (dep.startsWith('@twick/')) {
      internal.push(dep.replace('@twick/', ''));
    }
  }
  return internal;
}

function topologicalSort(packages) {
  const visited = new Set();
  const temp = new Set();
  const order = [];
  
  function visit(pkgName) {
    if (temp.has(pkgName)) {
      throw new Error(`Circular dependency detected: ${pkgName}`);
    }
    if (visited.has(pkgName)) {
      return;
    }
    
    temp.add(pkgName);
    
    const pkg = packages.find(p => p.name === pkgName);
    if (pkg) {
      const allDeps = [
        ...getAllInternalDependencies(pkg.dependencies),
        ...getAllInternalDependencies(pkg.devDependencies),
        ...getAllInternalDependencies(pkg.peerDependencies)
      ];
      
      for (const dep of allDeps) {
        if (PUBLISHABLE_PACKAGES.includes(dep)) {
          visit(dep);
        }
      }
    }
    
    temp.delete(pkgName);
    visited.add(pkgName);
    order.push(pkgName);
  }
  
  for (const pkgName of PUBLISHABLE_PACKAGES) {
    if (!visited.has(pkgName)) {
      visit(pkgName);
    }
  }
  
  return order.reverse();
}

function main() {
  const packagesDir = path.resolve(process.cwd(), 'packages');
  const packages = [];
  
  // Read all package.json files
  for (const pkgName of PUBLISHABLE_PACKAGES) {
    const packagePath = path.join(packagesDir, pkgName);
    if (fs.existsSync(packagePath)) {
      const deps = getPackageDependencies(packagePath);
      packages.push({
        name: pkgName,
        ...deps
      });
    }
  }
  
  // Get topological order
  const publishOrder = topologicalSort(packages);
  
  console.log('Publish order (dependency-aware):');
  publishOrder.forEach((pkg, index) => {
    console.log(`${index + 1}. ${pkg}`);
  });
  
  // Output as space-separated string for GitHub Actions
  console.log(`\nPublish order string: ${publishOrder.join(' ')}`);
  
  // Also output as JSON for debugging
  console.log(`\nPublish order JSON: ${JSON.stringify(publishOrder)}`);
}

if (require.main === module) {
  main();
}

module.exports = { main, topologicalSort, PUBLISHABLE_PACKAGES };
