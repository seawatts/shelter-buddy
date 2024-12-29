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
import { FieldType } from '@boundaryml/baml/native'
import { TypeBuilder as _TypeBuilder, EnumBuilder, ClassBuilder } from '@boundaryml/baml/type_builder'

export default class TypeBuilder {
    private tb: _TypeBuilder;
    
    

    constructor() {
        this.tb = new _TypeBuilder({
          classes: new Set([
            "Activity","Equipment","IntakeForm",
          ]),
          enums: new Set([
            "DifficultyLevel","Gender",
          ])
        });
        
        
    }

    __tb() {
      return this.tb._tb();
    }
    
    string(): FieldType {
        return this.tb.string()
    }

    literalString(value: string): FieldType {
        return this.tb.literalString(value)
    }

    literalInt(value: number): FieldType {
        return this.tb.literalInt(value)
    }

    literalBool(value: boolean): FieldType {
        return this.tb.literalBool(value)
    }

    int(): FieldType {
        return this.tb.int()
    }

    float(): FieldType {
        return this.tb.float()
    }

    bool(): FieldType {
        return this.tb.bool()
    }

    list(type: FieldType): FieldType {
        return this.tb.list(type)
    }

    null(): FieldType {
        return this.tb.null()
    }

    map(key: FieldType, value: FieldType): FieldType {
        return this.tb.map(key, value)
    }

    union(types: FieldType[]): FieldType {
        return this.tb.union(types)
    }

    addClass<Name extends string>(name: Name): ClassBuilder<Name> {
        return this.tb.addClass(name);
    }

    addEnum<Name extends string>(name: Name): EnumBuilder<Name> {
        return this.tb.addEnum(name);
    }
}