export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  let colIndex = 1;
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      // Add simple incremental custom class to each individual column div
      col.classList.add(`custom-col-${colIndex}`);
      colIndex += 1;

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
