/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* tslint:disable:no-unused-variable */

import {
  ComponentFactory,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  NgModuleRef,
  TemplateRef,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import { NgVarDirective } from './ng-var.directive';

describe('NgVarDirective', () => {
  it('should create an instance', () => {
    const directive = new NgVarDirective(
      new TestViewContainerRef(),
      new TestTemplateRef()
    );
    expect(directive).toBeTruthy();
  });
});

class TestTemplateRef extends TemplateRef<unknown> {
  get elementRef(): ElementRef<any> {
    throw new Error('Method not implemented.');
  }
  createEmbeddedView(context: unknown): EmbeddedViewRef<unknown> {
    throw new Error('Method not implemented.');
  }
}

class TestViewContainerRef extends ViewContainerRef {
  get element(): ElementRef<any> {
    throw new Error('Method not implemented.');
  }
  get injector(): Injector {
    throw new Error('Method not implemented.');
  }
  get parentInjector(): Injector {
    throw new Error('Method not implemented.');
  }
  clear(): void {
    throw new Error('Method not implemented.');
  }
  get(index: number): ViewRef | null {
    throw new Error('Method not implemented.');
  }
  get length(): number {
    throw new Error('Method not implemented.');
  }
  createEmbeddedView<C>(
    templateRef: TemplateRef<C>,
    context?: C,
    index?: number
  ): EmbeddedViewRef<C> {
    throw new Error('Method not implemented.');
  }
  createComponent<C>(
    componentFactory: ComponentFactory<C>,
    index?: number,
    injector?: Injector,
    projectableNodes?: any[][],
    ngModule?: NgModuleRef<any>
  ): ComponentRef<C> {
    throw new Error('Method not implemented.');
  }
  insert(viewRef: ViewRef, index?: number): ViewRef {
    throw new Error('Method not implemented.');
  }
  move(viewRef: ViewRef, currentIndex: number): ViewRef {
    throw new Error('Method not implemented.');
  }
  indexOf(viewRef: ViewRef): number {
    throw new Error('Method not implemented.');
  }
  remove(index?: number): void {
    throw new Error('Method not implemented.');
  }
  detach(index?: number): ViewRef | null {
    throw new Error('Method not implemented.');
  }
}
