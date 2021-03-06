function browserRequire(name) {
  if (name.charAt(0) == '.')
    return window.__flintInternals[name.replace('./', '')]

  if (name == 'bluebird')
    return window._bluebird

  let pkg = window.__flintPackages[name]

  // we may be waiting for packages reload
  if (!pkg)
    return

  // may not export a default
  if (!pkg.default)
    pkg.default = pkg

  return pkg
}

window.require = browserRequire