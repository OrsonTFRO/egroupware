# EGroupware CalDAV/CardDAV server and REST API

CalDAV/CardDAV is build on HTTP and WebDAV, implementing the following additional RFCs containing documentation of the protocol:
* [rfc4791: CalDAV: Calendaring Extensions to WebDAV](https://datatracker.ietf.org/doc/html/rfc4791)
* [rfc6638: Scheduling Extensions to CalDAV](https://datatracker.ietf.org/doc/html/rfc6638)
* [rfc6352: CardDAV: vCard Extensions to WebDAV](https://datatracker.ietf.org/doc/html/rfc6352)
* [rfc6578: Collection Synchronization for WebDAV](https://datatracker.ietf.org/doc/html/rfc6578)
* many additional extensions from former Apple Calendaring Server used by Apple clients and others

## Path / URL layout for CalDAV/CardDAV and REST is identical

One can use the following URLs relative (!) to https://example.org/egroupware/groupdav.php

- ```/```                        base of Cal|Card|GroupDAV tree, only certain clients (KDE, Apple) can autodetect folders from here
- ```/principals/```             principal-collection-set for WebDAV ACL
- ```/principals/users/<username>/```
- ```/principals/groups/<groupname>/```
- ```/<username>/```             users home-set with
- ```/<username>/addressbook/``` addressbook of user or group <username> given the user has rights to view it
- ```/<current-username>/addressbook-<other-username>/``` shared addressbooks from other user or group
- ```/<current-username>/addressbook-accounts/``` all accounts current user has rights to see
- ```/<username>/calendar/```    calendar of user <username> given the user has rights to view it
- ```/<username>/calendar/?download``` download whole calendar as .ics file (GET request!)
- ```/<current-username>/calendar-<other-username>/``` shared calendar from other user or group (only current <username>!)
- ```/<username>/inbox/```       scheduling inbox of user <username>
- ```/<username>/outbox/```      scheduling outbox of user <username>
- ```/<username>/infolog/```     InfoLog's of user <username> given the user has rights to view it
- ```/addressbook/``` all addressbooks current user has rights to, announced as directory-gateway now
- ```/addressbook-accounts/``` all accounts current user has rights to see
- ```/calendar/```    calendar of current user
- ```/infolog/```     infologs of current user
- ```/(resources|locations)/<resource-name>/calendar``` calendar of a resource/location, if user has rights to view
- ```/<current-username>/(resource|location)-<resource-name>``` shared calendar from a resource/location

Shared addressbooks or calendars are only shown in the users home-set, if he subscribed to it via his CalDAV preferences!

Calling one of the above collections with a GET request / regular browser generates an automatic index
from the data of a allprop PROPFIND, allow browsing CalDAV/CardDAV tree with a regular browser.

## REST API: using EGroupware CalDAV/CardDAV server with JSON
> currently implemented only for contacts!

Following RFCs / drafts used/planned for JSON encoding of ressources
* [draft-ietf-jmap-jscontact: JSContact: A JSON Representation of Contact Data](https://datatracker.ietf.org/doc/html/draft-ietf-jmap-jscontact-07) ([*](#implemented-changes-to-jscontact-draft-07-from-next-draft))
* [draft-ietf-jmap-jscontact-vcard-06: JSContact: Converting from and to vCard](https://datatracker.ietf.org/doc/html/draft-ietf-jmap-jscontact-vcard/)
* [rfc8984: JSCalendar: A JSON Representation of Calendar Data](https://datatracker.ietf.org/doc/html/rfc8984)

### Supported request methods and examples

* **GET** to collections with an ```Accept: application/json``` header return all resources (similar to WebDAV PROPFIND)
<details>
  <summary>Example: Getting all entries of a given users addessbook</summary>
  
```
curl https://example.org/egroupware/groupdav.php/<username>/addressbook/ -H "Accept: application/pretty+json" --user <username>
{
  "responses": {
    "/<username>/addressbook/1833": {
      "uid": "5638-8623c4830472a8ede9f9f8b30d435ea4",
      "prodId": "EGroupware Addressbook 21.1.001",
      "created": "2010-10-21T09:55:42Z",
      "updated": "2014-06-02T14:45:24Z",
      "name": [
        { "type": "personal", "value": "Default" },
        { "type": "surname", "value": "Tester" }
      ],
      "fullName": { "value": "Default Tester" },
      "organizations": {
        "org": {
          "name": "default.org",
          "units": {
            "org_unit": "department.default.org"
          }
        }
      },
      "emails": {
        "work": { "email": "test@test.com", "contexts": { "work": true }, "pref": 1 }
      },
      "phones": {
        "tel_work": { "phone": "+49 123 4567890", "pref": 1, "features": { "voice": true }, "contexts": { "work": true } },
        "tel_cell": { "phone": "012 3723567", "features": { "cell": true }, "contexts": { "work": true } }
      },
      "online": {
        "url": { "resource": "https://www.test.com/", "type": "uri", "contexts": { "work": true } }
      },
      "notes": [
        "Test test TEST\n\\server\\share\n\\\nother\nblah"
      ],
    },
    "/<username>/addressbook/list-36": {
      "uid": "dfa5cac5-987b-448b-85d7-6c8b529a835c",
      "name": "Example distribution list",
      "card": {
        "uid": "dfa5cac5-987b-448b-85d7-6c8b529a835c",
        "prodId": "EGroupware Addressbook 21.1.001",
        "updated": "2018-04-11T14:46:43Z",
        "fullName": { "value": "Example distribution list" }
      },
      "members": {
        "urn:uuid:5638-8623c4830472a8ede9f9f8b30d435ea4": true
      }
    }
  }
}
```
</details>
       
  following GET parameters are supported to customize the returned properties:
  - props[]=<DAV-prop-name> eg. props[]=getetag to return only the ETAG (multiple DAV properties can be specified)
    Default for addressbook collections is to only return address-data (JsContact), other collections return all props.
  - sync-token=<token> to only request change since last sync-token, like rfc6578 sync-collection REPORT
  - nresults=N limit number of responses (only for sync-collection / given sync-token parameter!)
    this will return a "more-results"=true attribute and a new "sync-token" attribute to query for the next chunk

<details>
   <summary>Example: Getting just ETAGs and displayname of all contacts in a given AB</summary>
   
```
curl -i 'https://example.org/egroupware/groupdav.php/<username>/addressbook/?props[]=getetag&props[]=displayname' -H "Accept: application/pretty+json" --user <username>
{
  "responses": {
    "/addressbook/1833": {
      "displayname": "Default Tester",
      "getetag": "\"1833:24\""
    },
    "/addressbook/1838": {
      "displayname": "Test Tester",
      "getetag": "\"1838:19\""
    }
  }
}
```
</details>

<details>
   <summary>Example: Start using a sync-token to get only changed entries since last sync</summary>
   
#### Initial request with empty sync-token and only requesting 10 entries per chunk:
```
curl 'https://example.org/egroupware/groupdav.php/addressbook/?sync-token=&nresults=10&props[]=displayname' -H "Accept: application/pretty+json" --user <username>
{
  "responses": {
    "/addressbook/2050": "Frau Margot Test-Notifikation",
    "/addressbook/2384": "Test Tester",
    "/addressbook/5462": "Margot Testgedöns",
    "/addressbook/2380": "Frau Test Defaulterin",
    "/addressbook/5474": "Noch ein Neuer",
    "/addressbook/5575": "Mr New Name",
    "/addressbook/5461": "Herr Hugo Kurt Müller Senior",
    "/addressbook/5601": "Steve Jobs",
    "/addressbook/5603": "Ralf Becker",
    "/addressbook/1838": "Test Tester"
  },
  "more-results": true,
  "sync-token": "https://example.org/egroupware/groupdav.php/addressbook/1400867824"
}
```
#### Requesting next chunk:
```
curl 'https://example.org/egroupware/groupdav.php/addressbook/?sync-token=https://example.org/egroupware/groupdav.php/addressbook/1400867824&nresults=10&props[]=displayname' -H "Accept: application/pretty+json" --user <username>
{
  "responses": {
    "/addressbook/1833": "Default Tester",
    "/addressbook/5597": "Neuer Testschnuffi",
    "/addressbook/5593": "Muster Max",
    "/addressbook/5628": "2. Test Contact",
    "/addressbook/5629": "Testen Tester",
    "/addressbook/5630": "Testen Tester",
    "/addressbook/5633": "Testen Tester",
    "/addressbook/5635": "Test4 Tester",
    "/addressbook/5638": "Test Kontakt",
    "/addressbook/5636": "Test Default"
  },
  "more-results": true,
  "sync-token": "https://example.org/egroupware/groupdav.php/addressbook/1427103057"
}
```
</details>

<details>
   <summary>Example: Requesting only changes since last sync</summary>
   
#### ```sync-token``` from last sync need to be specified (note the null for a deleted resource!)
```
curl 'https://example.org/egroupware/groupdav.php/addressbook/?sync-token=https://example.org/egroupware/groupdav.php/addressbook/1400867824' -H "Accept: application/pretty+json" --user <username>
{
  "responses": {
    "/addressbook/5597": null,
    "/addressbook/5593": {
      "uid": "5638-8623c4830472a8ede9f9f8b30d435ea4",
      "prodId": "EGroupware Addressbook 21.1.001",
      "created": "2010-10-21T09:55:42Z",
      "updated": "2014-06-02T14:45:24Z",
      "name": [
        { "type": "personal", "value": "Default" },
        { "type": "surname", "value": "Tester" }
      ],
      "fullName": "Default Tester",
....
    }
  },
  "sync-token": "https://example.org/egroupware/groupdav.php/addressbook/1427103057"
}
```
</details>

* **GET**  requests with an ```Accept: application/json``` header can be used to retrieve single resources / JsContact or JsCalendar schema
<details>
   <summary>Example: GET request for a single resource</summary>
   
```
curl 'https://example.org/egroupware/groupdav.php/addressbook/5593' -H "Accept: application/pretty+json" --user <username>
{
  "uid": "5638-8623c4830472a8ede9f9f8b30d435ea4",
  "prodId": "EGroupware Addressbook 21.1.001",
  "created": "2010-10-21T09:55:42Z",
  "updated": "2014-06-02T14:45:24Z",
  "name": [
    { "type": "personal", "value": "Default" },
    { "type": "surname", "value": "Tester" }
  ],
  "fullName": "Default Tester",
....
}
```
</details>

* **POST** requests to collection with a ```Content-Type: application/json``` header add new entries in addressbook or calendar collections
       (Location header in response gives URL of new resource)
<details>
   <summary>Example: POST request to create a new resource</summary>
   
```
cat <<EOF | curl -i 'https://example.org/egroupware/groupdav.php/<username>/addressbook/' -X POST -d @- -H "Content-Type: application/json" --user <username>
{
  "uid": "5638-8623c4830472a8ede9f9f8b30d435ea4",
  "prodId": "EGroupware Addressbook 21.1.001",
  "created": "2010-10-21T09:55:42Z",
  "updated": "2014-06-02T14:45:24Z",
  "name": [
    { "type": "personal", "value": "Default" },
    { "type": "surname", "value": "Tester" }
  ],
  "fullName": { "value": "Default Tester" },
....
}
EOF

HTTP/1.1 201 Created
Location: https://example.org/egroupware/groupdav.php/<username>/addressbook/1234
```
</details>

* **PUT**  requests with  a ```Content-Type: application/json``` header allow modifying single resources

* **DELETE** requests delete single resources

* one can use ```Accept: application/pretty+json``` to receive pretty-printed JSON eg. for debugging and exploring the API

#### Implemented changes to [JsContact draft 07](https://datatracker.ietf.org/doc/html/draft-ietf-jmap-jscontact-07) from next draft:
* localizedString type / object is removed in favor or regular String type and a [localizations object like in JsCalendar](https://datatracker.ietf.org/doc/html/rfc8984#section-4.6.1)
* [Vendor-specific Property Extensions and Values](https://datatracker.ietf.org/doc/html/draft-ietf-jmap-jscontact-07#section-1.3) use ```<domain-name>:<name>``` like in JsCalendar