// https://stackoverflow.com/questions/38582293/how-to-declare-a-variable-in-a-template-in-angular
// https://gist.github.com/KEIII/e55c99baceb89c0afb32d6bd528e7ca7
import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * Declare a variable in the template.
 * Eg. <i *ngVar="false as variable">{{ variable | json }}</i>
 */
@Directive({
  // selector: '[plmNgVar]',
  selector: '[ngVar]',
})
export class NgVarDirective {
  private context: {
    $implicit: unknown;
    ngVar: unknown;
  } = {
    $implicit: null,
    ngVar: null,
  };

  private hasView = false;

  @Input()
  set ngVar(context: unknown) {
    this.context.$implicit = this.context.ngVar = context;
    this.updateView();
  }

  constructor(
    private vcRef: ViewContainerRef,
    private templateRef: TemplateRef<unknown>
  ) {}

  private updateView() {
    // this.vcRef.clear();
    if (!this.hasView) {
      this.vcRef.createEmbeddedView(this.templateRef, this.context);
      this.hasView = true;
    }
  }
}
