import { log } from './scripts-common'
import hue from 'node-hue-api'
import { Optional } from 'typescript-optional'
import program from 'commander'
import {CommandLineAction} from "@rushstack/ts-command-line"

const { ofNullable } = Optional

const v3 = hue.v3

const { api, discovery } = v3

const { debug, info, warn, error } = log

const main = async () => {

}

main().catch(e => {
  error(`There was an issue running the main method. err: '${ofNullable(e).orElse('UNKNOWN')}'`);
  process.exit(1);
});