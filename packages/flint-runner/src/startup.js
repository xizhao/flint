import bridge from './bridge'
import compiler from './compiler'
import server from './server'
import bundler from './bundler'
import builder from './builder'
import opts from './opts'
import disk from './disk'
import gulp from './gulp'
import cache from './cache'
import keys from './keys'
import watchDeletes from './lib/watchDeletes'
import { logError, handleError, path, log } from './lib/fns'

// welcome to flint!

let started = false

async function startup(_opts = {}, isBuild) {
  if (started) return
  started = true

  console.log()

  // opts
  const appDir = _opts.appDir || path.normalize(process.cwd());
  const OPTS = await opts.setAll({ ..._opts, appDir, isBuild })

  // log
  log.setLogging()
  log('opts', OPTS)

  // init, order important
  await disk.init() // reads versions and sets up readers/writers
  await builder.clear.init() // ensures internal directories set up
  await opts.serialize() // write out opts to state file
  await* [
    cache.init(),
    bundler.init()
  ]

  compiler('init', OPTS)
  watchDeletes()
}

let gulpStarted = false

async function runGulp(opts) {
  await gulp.init(opts)
  await gulp.afterBuild()
}

//
// flint build
//

export async function build(opts = {}) {
  try {
    await startup(opts, true)
    await bundler.remakeInstallDir(true)
    await builder.clear.buildDir()
    builder.copy.assets()
    await runGulp({ once: opts.once })

    if (opts.watch)
      return gulp.watchForBuild()

    await builder.build()

    if (opts.once)
      return

    process.exit()
  }
  catch(e) {
    handleError(e)
  }
}

//
// flint run
//

export async function run(opts) {
  try {
    await startup(opts, false)
    await server.run()
    bridge.start()
    await runGulp()
    cache.serialize() // write out cache
    console.log() // space before install
    await bundler.all()
    console.log(`    Ready! ⇢  ` + `${server.url()}\n`.bold.green)
    keys.init()
  }
  catch(e) {
    handleError(e)
  }
}