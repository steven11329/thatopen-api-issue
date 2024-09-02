import * as WEBIFC from "web-ifc";

import * as OBC from "@thatopen/components";

export class IFCModel
  extends OBC.Component
  implements OBC.Disposable, OBC.Updateable
{
  static readonly uuid = "113b6ca1-cf61-4577-b11f-fb5efc5dc773";

  readonly onAfterUpdate = new OBC.Event();

  readonly onBeforeUpdate = new OBC.Event();

  readonly onDisposed = new OBC.Event();

  private _scene: OBC.SimpleScene;

  private _fragments: OBC.FragmentsManager;

  private _fragmentIfcLoader: OBC.IfcLoader;

  enabled = true;

  constructor(components: OBC.Components, scene: OBC.SimpleScene) {
    super(components);

    this._scene = scene;
    this._fragments = components.get(OBC.FragmentsManager);
    this._fragmentIfcLoader = components.get(OBC.IfcLoader);
    this._setup().then(() => this._loadIfc());
    components.add(IFCModel.uuid, this);
  }

  private async _setup() {
    const excludedCategories = [
      WEBIFC.IFCTENDONANCHOR,
      WEBIFC.IFCREINFORCINGBAR,
      WEBIFC.IFCREINFORCINGELEMENT,
    ];
    for (const cat of excludedCategories) {
      this._fragmentIfcLoader.settings.excludedCategories.add(cat);
    }
    this._fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
    await this._fragmentIfcLoader.setup();
  }

  private async _loadIfc() {
    const file = await fetch('https://thatopen.github.io/engine_components/resources/small.ifc');
    const data = await file.arrayBuffer();
    const buffer = new Uint8Array(data);
    const group = await this._fragmentIfcLoader.load(buffer);
    this._scene.three.add(group);
  }

  dispose() {
    this._fragments.dispose();
    this.enabled = false;
    this.onBeforeUpdate.reset();
    this.onAfterUpdate.reset();
    this.onDisposed.trigger();
    this.onDisposed.reset();
  }

  async update() {
    this.onBeforeUpdate.trigger();
    this.onAfterUpdate.trigger();
  }
}
