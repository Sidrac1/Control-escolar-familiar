from selenium import webdriver
import os
import subprocess
#hacer que esto corra el servidor y realice una prueba exitosa (testcase 1)

route = "c:/Users/Sidrac/OneDrive/Documentos/ProyectoEstadias/Control-escolar-familiar"

driver = webdriver.Chrome()

driver.get("http://127.0.0.1:3690/")