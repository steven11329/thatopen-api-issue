import { useEffect, useRef } from "react";
import * as OBC from "@thatopen/components";
import Stats from "stats.js";
import { IFCModel } from "./components/IFCModel";

const ThreeD = () => {
  const renderCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    //renderCountRef for avoid render twice when first load
    if (containerRef.current && renderCountRef.current > 0) {
      console.log('start');
      const components = new OBC.Components();
      const worlds = components.get(OBC.Worlds);
      const world = worlds.create<
        OBC.SimpleScene,
        OBC.SimpleCamera,
        OBC.SimpleRenderer
      >();

      world.scene = new OBC.SimpleScene(components);
      world.renderer = new OBC.SimpleRenderer(components, containerRef.current);
      world.camera = new OBC.SimpleCamera(components);

      const stats = new Stats();
      stats.showPanel(2);
      document.body.append(stats.dom);
      stats.dom.style.top = "0px";
      stats.dom.style.right = "0px";
      stats.dom.style.bottom = "unset";
      stats.dom.style.left = "unset";
      stats.dom.style.zIndex = "10";

      components.init();
      world.scene.setup();
      new IFCModel(components, world.scene);
      world.camera.controls.setLookAt(0, 10, -10, 0, 0, 0);
      world.renderer.onBeforeUpdate.add(() => stats.begin());
      world.renderer.onAfterUpdate.add(() => stats.end());

      return () => {
        components.dispose();
        document.body.removeChild(stats.dom);
      };
    }

    renderCountRef.current++;
  }, []);
  return <div ref={containerRef} className="three-d-page-container"></div>;
};

export default ThreeD;
