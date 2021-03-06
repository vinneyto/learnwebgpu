import jss from 'jss';
import preset from 'jss-preset-default';
import triangleDemo from './demo/01-triangle/triangle';
import cubeDemo from './demo/02-cube/cube';
import reset from './styles/reset';
import { styles } from './styles/style';

jss.setup(preset());
jss.createStyleSheet(reset).attach();

const { classes } = jss.createStyleSheet(styles).attach();

interface Demo {
  name: string;
  start: (container: HTMLElement) => Promise<void>;
}

const demos: Demo[] = [triangleDemo, cubeDemo];

const wrapper = document.createElement('div');
wrapper.className = classes.wrapper;
document.body.appendChild(wrapper);

const demoList = document.createElement('div');
demoList.className = classes.demoList;
wrapper.appendChild(demoList);

for (const demo of demos) {
  const item = document.createElement('div');
  item.classList.add(classes.demoItem);
  demoList.appendChild(item);

  const link = document.createElement('a');
  link.href = `#${demo.name}`;
  link.innerHTML = demo.name;
  link.classList.add(classes.demoItemLink);
  if (demo.name === location.hash.trim().substr(1)) {
    link.classList.add(classes.demoItemLinkActive);
  }
  item.appendChild(link);
}

const container = document.createElement('div');
container.className = classes.container;
wrapper.appendChild(container);

if (location.hash.trim().length !== 0) {
  const run = async () => {
    try {
      const demoName = location.hash.substr(1);
      const demo = demos.find((d) => d.name === demoName);

      if (demo === undefined) {
        throw new Error('unable to find the demo');
      }

      await demo.start(container);
    } catch (e) {
      const err = document.createElement('div');
      err.innerHTML = (e as Error).message;
      err.className = classes.err;
      container.appendChild(err);
      throw e;
    }
  };

  run();
} else {
  const hint = document.createElement('div');
  hint.innerHTML = '◄ Select demo from list';
  hint.className = classes.hint;
  container.appendChild(hint);
}

window.onhashchange = () => {
  location.reload();
};
