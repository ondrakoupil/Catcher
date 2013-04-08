Ext.define('catcher.controller.MatchController', {
    extend : 'Ext.app.Controller',

    config : {
        refs : {
            matchesNavigation : "matchesNavigation",
            matchDetail : "matchDetail",
            addPointDetail : "addPointDetail"
        },
        control : {
            "matchesList" : {
                disclose : "showMatchDetail"
            },
            "matchPlayerList" : {
                disclose : "showAddPoint"
            },
            "addPointDetail button" : {
                tap : "addPoint"
            },
            "matchDetail button[name=scoreHome]" : {
                tap : "showScoreHome"
            },
            "matchDetail button[name=scoreAway]" : {
                tap : "showScoreAway"
            },
        }
    },

    showMatchDetail : function(list, record) {
        var match = record.data;
        this.getMatchesNavigation().push({
            xtype : "matchDetail",
            title : match.home_name_short + " x " + match.away_name_short,
            data : match
        });
        var matchDetail = this.getMatchDetail();
        matchDetail.query("button[name=scoreHome]")[0].setText(new String(match.score_home));
        matchDetail.query("button[name=scoreAway]")[0].setText(new String(match.score_away));

        var homePlayers = Ext.create("catcher.store.Players");
        homePlayers.filter("team", match.home_id);

        var awayPlayers = Ext.create("catcher.store.Players"); // TODO Burkert: budou s create fungovat zmeny v hracich?
        awayPlayers.filter("team", match.away_id);

        matchDetail.query("matchPlayerList[name=homeTeam]")[0].setStore(homePlayers);
        matchDetail.query("matchPlayerList[name=awayTeam]")[0].setStore(awayPlayers);

        var session = Ext.getStore("Session").findRecord("uuid", Ext.device.Device.uuid);
        session.match_id = match.match_id;
    },

    showAddPoint : function(list, record) {
        var scoringPlayer = record.data;

        this.getMatchesNavigation().push({
            xtype : "addPointDetail",
            title : "Skóroval hráč " + fullName(scoringPlayer),
            data : scoringPlayer
        });

        var addPointDetail = this.getAddPointDetail();

        var players = Ext.getStore("Players");
        players.filter("team", scoringPlayer.team);

        var coPlayers = new Array();

        players.each(function(item, index, length) {
            var player = item.data;
            coPlayers.push({
                text : fullName(player),
                value : player.player_id
            });
        });
        players.clearFilter();

        addPointDetail.query("selectfield[name=assistPlayer]")[0].setOptions(coPlayers);
    },

    addPoint : function() {
        var scoringPlayer = this.getAddPointDetail().getData();

        var session = Ext.getStore("Session").findRecord("uuid", Ext.device.Device.uuid);
        var matchId = session.match_id;

        var assistPlayerId = this.getAddPointDetail().query("selectfield[name=assistPlayer]")[0].getValue();

        // Add the point and raise score.
        Ext.getStore("Points").add({
            team_id : scoringPlayer.team,
            player_id : scoringPlayer.player_id,
            match_id : matchId,
            assist_player_id : assistPlayerId
        });

        var match = Ext.getStore("Matches").findRecord("match_id", matchId, false, false, false, true).data;
        if (match.home_id == scoringPlayer.team) {
            match.score_home++;
        } else {
            match.score_away++;
        }

        this.getMatchesNavigation().pop(); // Back to the match overview (update scores).
        var matchDetail = this.getMatchDetail();
        matchDetail.query("button[name=scoreHome]")[0].setText(new String(match.score_home));
        matchDetail.query("button[name=scoreAway]")[0].setText(new String(match.score_away));

        var homePlayers = Ext.create("catcher.store.Players");
        homePlayers.filter("team", match.home_id);

        var awayPlayers = Ext.create("catcher.store.Players"); // TODO Burkert: budou s create fungovat zmeny v hracich?
        awayPlayers.filter("team", match.away_id);

        matchDetail.query("matchPlayerList[name=homeTeam]")[0].setStore(homePlayers);
        matchDetail.query("matchPlayerList[name=awayTeam]")[0].setStore(awayPlayers);
    },

    showScoreHome : function() {
        var session = Ext.getStore("Session").findRecord("uuid", Ext.device.Device.uuid);
        var matchId = session.match_id;
        var match = Ext.getStore("Matches").findRecord("match_id", matchId, false, false, false, true).data;
        showScore(match.match_id, match.home_id, this.getMatchesNavigation());
    },

    showScoreAway : function() {
        var session = Ext.getStore("Session").findRecord("uuid", Ext.device.Device.uuid);
        var matchId = session.match_id;
        var match = Ext.getStore("Matches").findRecord("match_id", matchId, false, false, false, true).data;
        showScore(match.match_id, match.away_id, this.getMatchesNavigation());
    },
});

function fullName(player) {
    return player.name + " " + player.surname + " #" + player.number;
};

function showScore(matchId, teamId, navigation) {
    var points = Ext.getStore("Points");
    points.filter("match_id", matchId);
    points.filter("team_id", teamId);

    var players = Ext.getStore("Players");
    players.clearFilter();
    players.filter("team", teamId);

    var pointsToDisplay = new Array();
    points.each(function(item, index, length) {

        var scoringPlayer = players.findRecord("player_id", new String(item.get("player_id")));
        var assistPlayer = players.findRecord("player_id", new String(item.get("assist_player_id")));

        pointsToDisplay.push({
            scoringPlayer : fullName(scoringPlayer.data),
            assistPlayer : fullName(assistPlayer.data),
            pointId : item.get("point_id")
        });
    });

    navigation.push({
        xtype : "scoreList",
        data : pointsToDisplay
    });
};
