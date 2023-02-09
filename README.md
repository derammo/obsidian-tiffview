# TIFF Viewer Prototype

To show a TIFF based image in both _Live Preview_ and _Reading_ modes, insert an inline command like this:

```
`!tiff examplefolder/exampleimage.tiff`
```

In _Live Preview_, the command tag will automatically hide itself when not being edited.  In `Reading` mode, the command is always hidden and only the image is shown. 

## Limitations

1. Currently does not automatically convert `![Text Here](somefile.tiff)` since the Obsidian core embedding code gets to it first?  This needs more research or a contribution to figure out how to interact with these and decorate them correctly.  I tried a `replace` decoration in a `ViewPlugin` extension and also in a `StateField` extension and neither worked.

2. The plugin currently edits the decoration DOM asynchronously, which may or may not be allowed in Obsidian.