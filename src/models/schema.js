export const schema = {
    "models": {
        "Contribution": {
            "name": "Contribution",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "name": {
                    "name": "name",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "title": {
                    "name": "title",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "category": {
                    "name": "category",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "start_date": {
                    "name": "start_date",
                    "isArray": false,
                    "type": "AWSDate",
                    "isRequired": false,
                    "attributes": []
                },
                "invite_link": {
                    "name": "invite_link",
                    "isArray": false,
                    "type": "AWSURL",
                    "isRequired": false,
                    "attributes": []
                },
                "contributiongroupsID": {
                    "name": "contributiongroupsID",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "participant": {
                    "name": "participant",
                    "isArray": true,
                    "type": "ID",
                    "isRequired": false,
                    "attributes": [],
                    "isArrayNullable": true
                },
                "owner": {
                    "name": "owner",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "target": {
                    "name": "target",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": true,
                    "attributes": []
                },
                "amount": {
                    "name": "amount",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": true,
                    "attributes": []
                },
                "num_of_month": {
                    "name": "num_of_month",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": true,
                    "attributes": []
                },
                "status": {
                    "name": "status",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                }
            },
            "syncable": true,
            "pluralName": "Contributions",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "key",
                    "properties": {
                        "name": "byContributionGroups",
                        "fields": [
                            "contributiongroupsID"
                        ]
                    }
                },
                {
                    "type": "auth",
                    "properties": {
                        "rules": [
                            {
                                "allow": "public",
                                "operations": [
                                    "create",
                                    "update",
                                    "delete",
                                    "read"
                                ]
                            }
                        ]
                    }
                }
            ]
        },
        "ContributionGroups": {
            "name": "ContributionGroups",
            "fields": {
                "id": {
                    "name": "id",
                    "isArray": false,
                    "type": "ID",
                    "isRequired": true,
                    "attributes": []
                },
                "description": {
                    "name": "description",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "status": {
                    "name": "status",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "target": {
                    "name": "target",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": true,
                    "attributes": []
                },
                "title": {
                    "name": "title",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "body_color": {
                    "name": "body_color",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "side_color": {
                    "name": "side_color",
                    "isArray": false,
                    "type": "String",
                    "isRequired": false,
                    "attributes": []
                },
                "amount": {
                    "name": "amount",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": true,
                    "attributes": []
                },
                "name": {
                    "name": "name",
                    "isArray": false,
                    "type": "String",
                    "isRequired": true,
                    "attributes": []
                },
                "num_of_month": {
                    "name": "num_of_month",
                    "isArray": false,
                    "type": "Int",
                    "isRequired": false,
                    "attributes": []
                },
                "Contributions": {
                    "name": "Contributions",
                    "isArray": true,
                    "type": {
                        "model": "Contribution"
                    },
                    "isRequired": false,
                    "attributes": [],
                    "isArrayNullable": true,
                    "association": {
                        "connectionType": "HAS_MANY",
                        "associatedWith": [
                            "contributiongroupsID"
                        ]
                    }
                },
                "createdAt": {
                    "name": "createdAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                },
                "updatedAt": {
                    "name": "updatedAt",
                    "isArray": false,
                    "type": "AWSDateTime",
                    "isRequired": false,
                    "attributes": [],
                    "isReadOnly": true
                }
            },
            "syncable": true,
            "pluralName": "ContributionGroups",
            "attributes": [
                {
                    "type": "model",
                    "properties": {}
                },
                {
                    "type": "auth",
                    "properties": {
                        "rules": [
                            {
                                "allow": "public",
                                "operations": [
                                    "create",
                                    "update",
                                    "delete",
                                    "read"
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    },
    "enums": {},
    "nonModels": {},
    "codegenVersion": "3.4.4",
    "version": "27dec915fba394f37455e49e8f441303"
};