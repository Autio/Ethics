# A Map of Spinoza’s Ethics

Explore how the claims in **Part I: Concerning God** depend on one another, with the complete Part I text alongside the map. Select a proposition to move directly to its statement, proof, and notes; select a corollary to jump to that exact paragraph.

An interactive reading companion for Spinoza’s geometric method: definitions and axioms become premises, and propositions become the foundations of later arguments.

## Explore the argument

- **Argument layers** arranges statements by their depth in the recorded dependency graph. Follow arrows down from premises to consequences.
- **Book order** arranges definitions, axioms, propositions, and corollaries in reading order. Use it to relate the map to the progression of the book.
- **Local dependencies** places a selected statement between its immediate premises and the statements that use it. Use it to understand one argument without the whole graph competing for attention.

Hover over a node to preview its description and highlight its immediate premises and consequences. Keyboard focus provides the same preview. Moving away restores the selected statement’s connections without moving the reader. Click a node or choose a passage from the selector. The reading pane scrolls to the matching passage and highlights it. The map highlights immediate connections, while **Uses** and **Used by** provide clickable paths through the argument. Each reading section has a **Locate in the map** button. Nodes also work with Tab and Enter or Space.

Selections have shareable fragment identifiers, such as `#1P14` for Proposition XIV and `#1P14C02` for its second corollary. On narrow screens the reader sits below the map. Reduced-motion preferences are respected.

## Personal highlights

Select a passage and choose **Highlight passage**. Highlights appear in the reader and as gold outlines in the map. Choose **Remove highlight** to remove the selected passage’s highlight.

Highlights are saved in this browser’s local storage, separately from the shared text and graph. Storage is specific to the website origin and browser profile: localhost and the live site have separate collections. Clearing site data removes them. If storage is unavailable, the page explains that a download is needed to preserve the collection.

**Download highlights** exports a versioned JSON file with passage IDs and creation timestamps. **Import highlights** validates this format and merges it into the current collection, preserving existing highlights. Use export/import to transfer between browsers or keep a backup. No highlights are sent to a server. Highlighting applies to whole passages, rather than selected words.

## Run locally

No build step, package installation, external JavaScript library, or account is required. Serve the repository with a static HTTP server:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000>. Opening `index.html` directly as a file will not reliably load the JSON data.

The same files can be served by GitHub Pages or any static host. The [original published version](https://autio.github.io/projects/spinoza_ethics/) is a historical deployment; updating this repository does not automatically update that separate site.

## Text and provenance

The reader contains all of Part I: its eight definitions, seven axioms, 36 propositions with proofs, notes and corollaries, and the appendix. It uses **R. H. M. Elwes’s translation**, from [Project Gutenberg ebook 3800](https://www.gutenberg.org/ebooks/3800). This is a public-domain translation, rather than a modern copyrighted edition. Gutenberg identifies its ebook as public domain in the USA; the retained source includes its full distribution notice and licence.

- `data/elwes-source.txt` retains the complete downloaded Gutenberg source, including credits and terms.
- `data/text.json` contains the Part I reading sections. Original wording is retained; line wrapping is normalised for display.
- `scripts/build_text.py` regenerates those sections and validates that every graph node has a corresponding text anchor.
- `data/graph.json` preserves the 65 nodes and 140 directed links from the original Part I graph, based on data compiled by **R. F. Tredwell**.

Arrows mean **the source is a recorded premise for the target**. This is an editorial dependency map, not a formal verification of Spinoza’s proofs. The short node summaries come from the original dataset and may differ from the Elwes wording; the reader provides the source text. Parts II–V are not currently mapped or displayed.

The original visualisation followed [Friedman’s poster](https://dailynous.com/wp-content/uploads/2014/10/friedman-spinoza-chart.jpg). The legacy scripts and images remain in the repository as historical reference; the new page uses `app.js` and `styles.css`.

## Contributing

Corrections to dependency links and short summaries are welcome. Please cite the relevant part, proposition, proof, or corollary, and explain whether the change corrects a transcription error or proposes a different interpretation. For text corrections, update the retained source deliberately and regenerate:

```sh
python3 scripts/build_text.py
node --check app.js
```

Before submitting interface changes, check all three views, proposition and corollary navigation, keyboard selection, fragment links, and the stacked layout on a narrow screen.

## Licence

The application retains the repository’s [GNU GPL version 2 licence](LICENSE). The underlying historical translation is public domain; the retained Project Gutenberg source carries its own distribution notice. Dependency-data attribution to R. F. Tredwell is preserved.
