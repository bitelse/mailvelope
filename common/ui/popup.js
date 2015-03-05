/**
 * Mailvelope - secure email with OpenPGP encryption for Webmail
 * Copyright (C) 2014  Thomas Oberndörfer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License version 3
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

var mvelo = mvelo || null;

(function() {
  var crx = typeof chrome !== 'undefined';
  var activeState;
  var sendMessage;

  if (!crx) {
    // Firefox
    sendMessage = function(msg) {
      addon.postMessage(msg);
    };
    addon.on('message', messageListener);
  } else {
    // Chrome
    sendMessage = function(msg) {
      chrome.runtime.sendMessage(msg, messageListener);
    };
  }

  function init() {
    console.log("Init");
    $('.popup').on('click', 'a', function(event) {
      if (mvelo.crx) {
        hide();
      } else {
        sendMessage({event: 'dummy'});
      }
    });
    $('.popup').on('click', 'button', function(event) {
      // id of dropdown entry = action
      if (this.id === 'state' || this.id === '') {
        return;
      }
      var message = {
        event: 'browser-action',
        action: this.id
      };
      sendMessage(message);
      hide();
    });
    sendMessage({event: 'get-prefs'});
    $('#state').on('click', function() {
      var msg;
      if (activeState) {
        msg = {event: 'deactivate'};
      } else {
        msg = {event: 'activate'};
      }
      activeState = !activeState;
      handleAppActivation();
      sendMessage(msg);
      hide();
    });
    if (mvelo.crx) {
      mvelo.l10n.localizeHTML();
    }
    $('[data-toggle="tooltip"]').tooltip();
  }

  function hide() {
    if (crx) {
      $(document.body).fadeOut(function() {
        window.close();
      });
    }
  }

  function handleAppActivation() {
    if (activeState) {
      $('#state .glyphicon').removeClass('glyphicon-unchecked').addClass('glyphicon-check');
      $('#add').removeClass('disabled').css('pointer-events', 'auto');
      $('#reload').removeClass('disabled').css('pointer-events', 'auto');
    } else {
      $('#state .glyphicon').removeClass('glyphicon-check').addClass('glyphicon-unchecked');
      $('#add').addClass('disabled').css('pointer-events', 'none');
      $('#reload').addClass('disabled').css('pointer-events', 'none');
    }
  }

  function messageListener(msg) {
    switch (msg.event) {
      case 'get-prefs':
        activeState = msg.prefs.main_active;
        handleAppActivation();
        break;
      case 'is-supported-noapi':
        console.log("App active: " + msg.isSupported);
        //handleActivation(msg.isSupported);
        break;
    }
  }

  $(document).ready(init);

}());
