import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `${projects.length} Projects`;
const projectsContainer = document.querySelector('.projects');
let selectedIndex = -1;
renderProjects(projects, projectsContainer, 'h2');
function renderPieChart(projectsGiven) {
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

  let sliceGenerator = d3.pie()
    .value((d) => d.value)
    .sort(null);

  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  let legend = d3.select('.legend');
  legend.selectAll('li').remove();

  arcs.forEach((arc, idx) => {
  svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx))
    .attr('class', idx === selectedIndex ? 'selected' : '')
    .on('click', () => {
      selectedIndex = selectedIndex === idx ? -1 : idx;

      if (selectedIndex === -1) {
        renderProjects(projects, projectsContainer, 'h2');
      } else {
        let selectedYear = data[selectedIndex].label;

        let filteredProjects = projects.filter((project) => {
          return project.year === selectedYear;
        });

        renderProjects(filteredProjects, projectsContainer, 'h2');
      }

      renderPieChart(projects);
    });
  });

  data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`)
    .attr('class', idx === selectedIndex ? 'selected' : '')
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}
renderPieChart(projects);

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  // update query value
  query = event.target.value;
  // filter projects
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});