# eslint-import-resolver-preconstruct

> Resolve [preconstruct][] dev modules for [eslint-plugin-import][]

## Usage

```sh
npm i -D eslint-import-resolver-preconstruct
```

```yaml
# .eslintrc.yml
settings:
  import/resolver:
    preconstruct: true
    node: true
```

You _must_ include the default resolver explicitly, as `eslint-import-resolver-preconstruct` does **not** replace its functionality.

[preconstruct]: https://preconstruct.tools
[eslint-plugin-import]: https://github.com/benmosher/eslint-plugin-import
