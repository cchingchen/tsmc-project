import os
import logging
import uuid
import pendulum
import contextvars
from logging.handlers import TimedRotatingFileHandler
from pythonjsonlogger import jsonlogger

trace_id_var = contextvars.ContextVar("trace_id", default="no-trace-id")

class TaipeiJSONFormatter(jsonlogger.JsonFormatter):
    def formatTime(self, record, datefmt=None):
        dt = pendulum.from_timestamp(record.created, tz='Asia/Taipei')
        return dt.format('YYYY-MM-DD HH:mm:ss.SSS')

class LogManager:
    def __init__(self, service_name, log_dir="./logs"):
        self.logger = logging.getLogger(service_name)
        self.logger.setLevel(logging.INFO)
        
        if not self.logger.handlers:
            os.makedirs(log_dir, exist_ok=True)
            log_path = os.path.join(log_dir, f"{service_name}.log")
            
            handlers = [
                TimedRotatingFileHandler(
                    log_path, when="midnight", interval=1, backupCount=30, encoding="utf-8"
                ),
                logging.StreamHandler()
            ]

            log_format = '%(asctime)s %(levelname)s %(name)s %(message)s %(trace_id)s'
            formatter = TaipeiJSONFormatter(log_format, json_ensure_ascii=False)
            
            for handler in handlers:
                handler.setFormatter(formatter)
                self.logger.addHandler(handler)

    @staticmethod
    def generate_trace_id():
        return str(uuid.uuid4())

    @staticmethod
    def set_trace_id(tid=None):
        token = tid or LogManager.generate_trace_id()
        trace_id_var.set(token)
        return token

    @staticmethod
    def get_current_trace_id():
        return trace_id_var.get()

    def _log(self, level, message, trace_id=None, **kwargs):
        current_tid = trace_id or trace_id_var.get()
        extra = {"trace_id": current_tid}
        extra.update(kwargs)
        
        log_func = getattr(self.logger, level.lower())
        log_func(message, extra=extra)

    def debug(self, message, **kwargs):
        self._log('DEBUG', message, **kwargs)

    def info(self, message, **kwargs):
        self._log('INFO', message, **kwargs)

    def warning(self, message, **kwargs):
        self._log('WARNING', message, **kwargs)

    def error(self, message, **kwargs):
        self._log('ERROR', message, **kwargs)

    def critical(self, message, **kwargs):
        self._log('CRITICAL', message, **kwargs)