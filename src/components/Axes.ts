import * as THREE from 'three';

import * as OBC from '@thatopen/components';

export class Axes
  extends OBC.Component
  implements OBC.Disposable, OBC.Updateable
{
  static readonly uuid = 'e81474cd-eb1b-4c07-9b25-70767dfe6199';

  readonly onAfterUpdate = new OBC.Event();

  readonly onBeforeUpdate = new OBC.Event();

  readonly onDisposed = new OBC.Event();

  private _scene: OBC.SimpleScene;

  private _axesHelper: THREE.AxesHelper;

  enabled = true;

  constructor(components: OBC.Components, scene: OBC.SimpleScene) {
    super(components);

    this._scene = scene;
    this._axesHelper = new THREE.AxesHelper(5);
    this._scene.three.add(this._axesHelper);
    this._axesHelper.dispose();

    components.add(Axes.uuid, this);
  }

  dispose() {
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
