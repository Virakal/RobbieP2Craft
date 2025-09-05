#!/usr/bin/env node
import { copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import { execa } from 'execa'
import { mkdirp } from 'mkdirp'
import { rimraf } from 'rimraf'

const MMHMM = 'mmhmm.ogg'
const MMHMM_OH_YEAH = 'mmhmm-oh-yeah.ogg'

const SOUNDMAP = {
	mob: {
		villager: {
			death: MMHMM_OH_YEAH,
			haggle1: MMHMM,
			haggle2: MMHMM,
			haggle3: MMHMM,
			hit1: MMHMM,
			hit2: MMHMM,
			hit3: MMHMM_OH_YEAH,
			hit4: MMHMM_OH_YEAH,
			idle1: MMHMM,
			idle2: MMHMM,
			idle3: MMHMM_OH_YEAH,
			no1: MMHMM,
			no2: MMHMM,
			no3: MMHMM_OH_YEAH,
			yes1: MMHMM,
			yes2: MMHMM,
			yes3: MMHMM_OH_YEAH,
		},
	},
}

const BUILD_PATH = join(import.meta.dirname, 'build')
const BASE_PATH = join(BUILD_PATH, 'assets/minecraft/sounds/')
const SOUND_PATH = join(import.meta.dirname, 'sounds')

await rimraf(BUILD_PATH)
await mkdirp(BUILD_PATH)

const copyPromises = []

for (const filename of ['pack.mcmeta', 'pack.png']) {
	const source = join(import.meta.dirname, filename)
	const dest = join(BUILD_PATH, filename)
	console.log(`Copying ${source} to ${dest}`)
	copyPromises.push(copyFile(source, dest))
}

for (const [cat1, cat1Val] of Object.entries(SOUNDMAP)) {
	for (const [cat2, cat2Val] of Object.entries(cat1Val)) {
		const basePath = join(BASE_PATH, cat1, cat2)
		await mkdirp(basePath)

		for (const [soundName, sound] of Object.entries(cat2Val)) {
			const dest = join(basePath, `${soundName}.ogg`)
			const source = join(SOUND_PATH, sound)
			console.log(`Copying ${source} to ${dest}`)
			copyPromises.push(copyFile(source, dest))
		}
	}
}

await Promise.all(copyPromises)

const zipfile = join(import.meta.dirname, 'RobbieP2Family.zip')
console.log(`\nZipping to ${zipfile}`)
await rimraf(zipfile)
await execa('7z', ['a', '-tzip', zipfile, 'build/./*'])
console.log('Done!');
