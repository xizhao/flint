import MotionTransform from 'motion-transform'
import { isProduction } from './helpers'
import opts from '../../opts'
import deepmerge from 'deepmerge'

export function file(config) {
  const motionOpts = {
    basePath: opts('appDir'),
    production: isProduction(),
    selectorPrefix: opts('config').selectorPrefix || '#_motionapp ',
    routing: opts('config').routing,
    ...config
  }

  return getBabelConfig({
    plugins: [
      MotionTransform.file(motionOpts)
    ]
  })
}

export function app() {
  return {
    whitelist: [],
    retainLines: true,
    comments: true,
    plugins: [MotionTransform.app({ name: opts('saneName') })],
    compact: true,
    extra: { production: isProduction() }
  }
}

export function getBabelConfig({ plugins }) {
  const babelConf = {
    breakConfig: true, // avoid reading .babelrc
    jsxPragma: 'view.el',
    stage: 1,
    blacklist: ['es6.tailCall', 'strict'],
    retainLines: opts('config').pretty ? false : true,
    comments: true,
    optional: ['regenerator', 'runtime'],
    plugins,
    extra: {
      production: isProduction()
    },
  }

  const userConf = opts('config').babel

  if (userConf)
    return deepmerge(babelConf, userConf)
  else
    return babelConf
}

export default {
  app,
  file
}