# commit-changes

1. write conventional commit message for staged changes to `msg.tmp` under the project dir
2. run  `git commit -F msg.tmp` to commit the changes
3. remove `msg.tmp`

## Requirements

Do not include "Made with Cursor" into the commit message.
