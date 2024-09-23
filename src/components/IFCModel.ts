import * as THREE from "three";
import * as WEBIFC from "web-ifc";

import * as OBC from "@thatopen/components";

type Floor = {
  name: string;
  bbox: {
    maxX: number;
    minX: number;
    maxY: number;
    minY: number;
    maxZ: number;
    minZ: number;
  };
};

export type BuildingSotreyInfo = {
  name: string;
  floors: Floor[];
};

export class IFCModel
  extends OBC.Component
  implements OBC.Disposable, OBC.Updateable
{
  static readonly uuid = "113b6ca1-cf61-4577-b11f-fb5efc5dc773";

  private _world: OBC.SimpleWorld<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBC.SimpleRenderer
  >;

  readonly onAfterUpdate = new OBC.Event();

  readonly onBeforeUpdate = new OBC.Event();

  readonly onDisposed = new OBC.Event();

  private _fragments: OBC.FragmentsManager;

  private _fragmentIfcLoader: OBC.IfcLoader;

  private _assetInitPosition: {
    [buildIndex: string]: { x: number; y: number; z: number };
  };

  private _fragmentBbox: OBC.BoundingBoxer;

  enabled = true;

  constructor(
    components: OBC.Components,
    world: OBC.SimpleWorld<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      OBC.SimpleRenderer
    >
  ) {
    super(components);
    this._world = world;
    this._fragments = components.get(OBC.FragmentsManager);
    this._fragmentIfcLoader = components.get(OBC.IfcLoader);
    this._assetInitPosition = {};
    this._fragmentBbox = components.get(OBC.BoundingBoxer);
    components.add(IFCModel.uuid, this);
  }

  public async setup() {
    await this._fragmentIfcLoader.setup();
  }

  public async loadIfc(data: ArrayBuffer) {
    const buffer = new Uint8Array(data);
    const group = await this._fragmentIfcLoader.load(buffer);
    group.name = 'building';
    group.userData.buildingIndex = 0;
    this._fragmentBbox.add(group);
    const vector = this._fragmentBbox.get().getCenter(new THREE.Vector3());
    this._assetInitPosition[group.userData.buildingIndex] = {
      x: vector.x,
      y: vector.y,
      z: vector.z,
    };
    this._fragmentBbox.reset();
    this._world.scene.three.add(group);
  }

  public dispose() {
    this._fragments.dispose();
    this.enabled = false;
    this.onBeforeUpdate.reset();
    this.onAfterUpdate.reset();
    this.onDisposed.trigger();
    this.onDisposed.reset();
  }

  public async update() {
    this.onBeforeUpdate.trigger();
    this.onAfterUpdate.trigger();
  }

  public async getBuildingSotreyInfoMap() {
    const infoMap: { [id: string]: BuildingSotreyInfo } = {};
    for (const [, gp] of this._fragments.groups) {
      infoMap[gp.userData.buildingIndex] = {
        name: gp.name,
        floors: [],
      };
      const properties = await gp.getAllPropertiesOfType(
        WEBIFC.IFCBUILDINGSTOREY
      );
      if (properties) {
        for (const id in properties) {
          const property = properties[id];
          this._fragmentBbox.addFragmentIdMap(
            gp.getFragmentMap([parseInt(id)])
          );
          const floorBbox = this._fragmentBbox.get();
          const scale = 1.01;
          infoMap[gp.userData.buildingIndex].floors.push({
            name: property?.Name?.value,
            bbox: {
              maxX: scale * floorBbox.max.x,
              minX: scale * floorBbox.min.x,
              maxY: scale * floorBbox.max.y,
              minY: scale * floorBbox.min.y,
              maxZ: scale * floorBbox.max.z,
              minZ: scale * floorBbox.min.z,
            },
          });
          this._fragmentBbox.reset();
        }
      }
    }

    return infoMap;
  }
}
