# Generating [Libraries](https://nx.dev/l/a/structure/creating-libraries)
* Run `nx g @nrwl/angular:library --name=myLib --tags=scope:web`
* Keep in mind the different [library types](https://nx.dev/l/a/structure/library-types)
* Use [tags](https://nx.dev/l/a/structure/monorepo-tags) to enforce library boundaries
* When using tags, update `depConstraints` in [.eslintrc.json](.eslintrc.json) to [enforce library boundaries](https://medium.com/showpad-engineering/how-to-programmatically-enforce-boundaries-between-applications-and-libraries-in-an-nx-monorepo-39bf8fbec6ba)

Libraries are sharable across other libraries and applications. They can be imported from `@plm/myLib`


## [Library types](https://nx.dev/l/a/structure/library-types)
* **Feature:** Developers should consider feature libraries as libraries that implement smart UI (with access to data sources) for specific business use cases or pages in an application.
* **UI:** Contains only presentational components (also called "dumb" components).
* **Data-access:** Contains code for interacting with a back-end system. It also includes all the code related to state management.
* **Utility:** Contains low-level utilities used by many libraries and applications.
