import { Hook, Manifest } from "../../plugos/types";
import { System } from "../../plugos/system";
import { CompletionResult } from "@codemirror/autocomplete";

export type CompleterHookT = {
  isCompleter?: boolean;
};

export class CompleterHook implements Hook<CompleterHookT> {
  private system?: System<CompleterHookT>;

  public async plugCompleter(): Promise<CompletionResult | null> {
    let completerPromises = [];
    // TODO: Can be optimized (cache all functions)
    for (const plug of this.system!.loadedPlugs.values()) {
      if (!plug.manifest) {
        continue;
      }
      for (const [functionName, functionDef] of Object.entries(
        plug.manifest.functions
      )) {
        if (functionDef.isCompleter) {
          completerPromises.push(plug.invoke(functionName, []));
        }
      }
    }
    let allCompletionResults = await Promise.all(completerPromises);
    if (allCompletionResults.length === 1) {
      return allCompletionResults[0];
    } else if (allCompletionResults.length > 1) {
      console.error(
        "Got completion results from multiple sources, cannot deal with that",
        allCompletionResults
      );
    }
    return null;
  }

  apply(system: System<CompleterHookT>): void {
    this.system = system;
  }

  validateManifest(manifest: Manifest<CompleterHookT>): string[] {
    return [];
  }
}