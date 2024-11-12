# TableIQ Cloud at a glance

This is an experiment to "combine the simplicity of spreadsheets, the structure of a database, and the analytical power of Jupyter-styled Notebooks. It's stems from some of my frustrations with using Airtable and wishing for a better developer/user experience.

## WHY

My day-to-day work requires that I use Airtable (a tool that combines the features of a spreadsheet and a database in a cloud-based offering). For the most part, I find it is easy to use as it allows us to quickly store and access data, create simple, custom workflows and user-interfaces without complex coding - Yeaaa.

However, Airtable fails when I need things like:

-   Data linage and versioning
-   Experiment tracking and data modelling
-   Notebook-styled analysis
-   Advance data visualization.

## WHAT

This project will explore building a tool that blends Airtable’s accessible, data organization and interface with some of the concepts below:

-   Integrated code cells for computation and analysis (Python, SQL, R).
-   Real-time, collaborative data manipulation and coding - maybe?.
-   _Richer_ visualizations and customizable, interactive dashboards.
-   Strong database and ETL connections with support for joins and queries.
-   Data versioning, experiment tracking, and scalability for large datasets.
-   ~~Data science-specific automation capabilities.~~ Extended workflows (like with Camunda).
-   Gradual onboarding from no-code to low-code to full-code - waaay in the future.

This project could become a hybrid platform that provides a flexible, collaborative data environment where technical and non-technical users alike could store, analyze, and present data efficiently without switching and copying data across tools.

## HOW

I want to use an MVP-approach to validate/invalidate if this is useful to others. The final will be a combination of the core functionalities of a spreadsheet, database, _and_ Jupyter Notebook.

### Roadmap (March 2025)

The current plan is to have the following three features in the first release (MVP):

1. Unified Data Organization with Simple Relational Links

    **Why**: The core strength of Airtable is its flexible, "flat-ish" data organization that allows users to create and link tables easily. However, there is a need for more complex relational structures that give users more flexibility when combining and querying data, similar to relational databases without the rigidity or complexity of a full SQL database.

2. Embedded Code Cells for Analysis and Transformation

    **Why**: A major gap in Airtable is its lack of embedded analytical capabilities. Including Jupyter-style code cells for Python (or SQL) within the same environment would be a unique and valuable feature for data analysis.

3. Basic Visualization and Dashboarding Tools

    **Why**: We regularly need to visualize data for making decisions. I'd like to eliminate needing to copy data across tools to make analysis understandable and sharable. Simple, customizable charting options would make the platform versatile for data exploration and reporting.
