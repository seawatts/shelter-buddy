/*************************************************************************************************

Welcome to Baml! To use this generated code, please run one of the following:

$ npm install @boundaryml/baml
$ yarn add @boundaryml/baml
$ pnpm add @boundaryml/baml

*************************************************************************************************/

// This file was generated by BAML: do not edit it. Instead, edit the BAML
// files and re-generate this code.
//
/* eslint-disable */
// tslint:disable
// @ts-nocheck
// biome-ignore format: autogenerated code
import { Image } from "@boundaryml/baml"

export interface Checked<T,CheckName extends string = string> {
    value: T,
    checks: Record<CheckName, Check>,
}

export interface Check {
    name: string,
    expr: string
    status: "succeeded" | "failed"
}

export function all_succeeded<CheckName extends string>(checks: Record<CheckName, Check>): boolean {
    return get_checks(checks).every(check => check.status === "succeeded")
}

export function get_checks<CheckName extends string>(checks: Record<CheckName, Check>): Check[] {
    return Object.values(checks)
}
export enum DifficultyLevel {
  Yellow = "Yellow",
  Purple = "Purple",
  Red = "Red",
}

export enum Gender {
  Male = "Male",
  Female = "Female",
}

export interface Activity {
  activity: string
  isApproved: boolean
  
}

export interface Equipment {
  inKennel: string[]
  outOfKennel: string[]
  
}

export interface IntakeForm {
  id: string
  name: string
  breed: string
  gender: Gender
  difficultyLevel: DifficultyLevel
  isFido: boolean
  generalNotes?: string | null
  approvedActivities: Activity[]
  equipmentNotes: Equipment
  
}

export interface TestResponse {
  message: string
  timestamp: string
  isSuccess: boolean
  
}
