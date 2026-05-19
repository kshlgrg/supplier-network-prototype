# Vypaar Saathi Prototype

Vypaar Saathi is a lightweight prototype for supplier network planning, onboarding, risk review, supplier comparison, and allocation optimization.

## What It Includes

- Landing page for demo showcase
- Guided workspace creation flow
- Supplier and buyer data entry
- Risk and network overview
- Optimization and comparison views
- Visual design-process documentation and printable learner-template PDF
- Prototype screenshots for evaluation and documentation use

## Live Links

- Prototype: https://kshlgrg.github.io/supplier-network-prototype/
- Visual design process: https://kshlgrg.github.io/supplier-network-prototype/docs/design-process.html
- Design process PDF: https://kshlgrg.github.io/supplier-network-prototype/docs/design-process.pdf
- Learner-template design process: https://kshlgrg.github.io/supplier-network-prototype/docs/design-process-learner.html
- Learner-template design process PDF: https://kshlgrg.github.io/supplier-network-prototype/docs/design-process-learner.pdf

## Documentation Approach

The project documentation follows a design-process format: discovery, problem definition, research synthesis, persona and empathy work, ideation, concept selection, prototyping, testing, and final reflection. The learner-template HTML/PDF uses a research-paper inspired visual treatment with red section headings, formal tables, evidence images, and prototype screenshots.

## Run Locally

Because this is a static prototype, you can serve it with any simple HTTP server.

```bash
python3 -m http.server 3000
```

Then open `http://127.0.0.1:3000/`.

## Project Files

- `index.html` - app shell and screens
- `style.css` - visual system and responsive styles
- `app.js` - interaction logic and prototype behavior
- `data.js` - sample data
- `docs/user-journey.md` - user journey and design rationale
- `docs/user-transcripts.md` - short prototype interview transcripts
- `docs/technical-report.md` - technical walkthrough
- `docs/design-process.md` - design process, usability principles, and validation checklist
- `docs/design-process.html` - visual and printable version of the design process documentation
- `docs/design-process.pdf` - exported PDF version of the visual design process documentation
- `docs/design-process-learner.html` - design process document following the provided learner DOCX template
- `docs/design-process-learner.css` - CSS for the learner-template design process document
- `docs/design-process-learner.pdf` - printable PDF generated from the learner-template HTML document
- `docs/design-assets/` - brainstorm, mind map, affinity map, and SCAMPER evidence images
- `prototype-screenshots/` - captured prototype screens used in documentation
